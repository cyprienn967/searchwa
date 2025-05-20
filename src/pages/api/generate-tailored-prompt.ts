import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Fetch user profile from Redis
  const user = await redis.json.get('2');
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Type guard for user fields (cast to any to silence linter)
  const userAny = user as any;
  const about = typeof userAny.about === 'string' ? userAny.about : '';
  const age = typeof userAny.age === 'string' || typeof userAny.age === 'number' ? userAny.age : '';
  const location = typeof userAny.location === 'string' ? userAny.location : '';

  // Prepare the system prompt for Azure OpenAI
  const baselinePrompt = `You are Steer, a helpful search assistant trained by Steer AI. Your task is to deliver a concise and accurate response to a user's query, drawing from the given search results. Your answer must be precise, of high-quality, and written by an expert using an unbiased and journalistic tone. It is EXTREMELY IMPORTANT to directly answer the query. NEVER say 'based on the search results' or start your answer with a heading or title. Get straight to the point. Your answer must be written in the same language as the query, even if language preference is different. You MUST cite the most relevant search results that answer the query. Do not mention any irrelevant results. If the search results are empty or unhelpful, answer the query as well as you can with existing knowledge. You MUST NEVER use moralization or hedging language. AVOID using the following phrases - "it is important to...." - "it is inappropriate..." - "it is subjective...". You MUST ADHERE to the following formatting instructions - use markdown to format paragraphs, lists, tables and quotes whenever possible. - use headings level 2 and 3 to separate sections of your response, like "## Header", but NEVER start an answer with a heading or title of any kind (i.e. Never start with #). -Use single new lines for lists and double new lines for paragraphs. -use markdown to render images given in the search results. NEVER write URLs or links. `;
  const systemPrompt = `Here is a baseline prompt for a search assistant:\n${baselinePrompt}\n\nThe user profile is:\n- About: ${about}\n- Age: ${age}\n- Location: ${location}\n\nRewrite the baseline prompt so that it is tailored for this user. For example, if the user is a child, make the language simpler and the format easier to read. If the user is an expert, keep it technical. Output only the new tailored prompt. Keep much of the baseline prompt the same, but edit it so that it is personalised to each user. This is for a personalised search engine so tailoring is very important`;

  // Debug logs for env variables
  console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('AZURE_OPENAI_KEY:', process.env.AZURE_OPENAI_KEY);

  // Call Azure OpenAI (ChatGPT) to generate the tailored prompt
  try {
    const azureResponse = await axios.post(
      process.env.AZURE_OPENAI_ENDPOINT!,
      {
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'api-key': process.env.AZURE_OPENAI_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    const tailoredPrompt = azureResponse.data.choices?.[0]?.message?.content?.trim();
    if (!tailoredPrompt) {
      return res.status(500).json({ error: 'No tailored prompt returned from LLM' });
    }

    // Save the tailored prompt to the user's profile in Redis
    await redis.json.set('2', '$.prompt', tailoredPrompt);

    return res.status(200).json({ prompt: tailoredPrompt });
  } catch (error: any) {
    console.error('Error generating tailored prompt:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to generate tailored prompt' });
  }
} 