import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';
import OpenAI from 'openai';

interface UserData {
  about?: string;
  age?: string | number;
  location?: string;
  code?: string;
  flag?: boolean;
  interests?: string[];
  name?: string;
  prompt?: string;
  feedback?: Record<string, any>;
}

interface UserDatabase {
  [email: string]: UserData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Fetch all users from Redis (now using key '2')
  const allUsers = await redis.json.get('userdata') as UserDatabase | null;
  if (!allUsers) {
    return res.status(404).json({ error: 'No users found' });
  }

  // Get the specific user's data
  const user = allUsers[email];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Type guard for user fields
  const about = typeof user.about === 'string' ? user.about : '';
  const age = typeof user.age === 'string' || typeof user.age === 'number' ? user.age : '';
  const location = typeof user.location === 'string' ? user.location : '';

  // Prepare the system prompt for Azure OpenAI
  const baselinePrompt = `You are Steer, a helpful search assistant trained by Steer AI. Your task is to deliver a concise and accurate response to a user's query, drawing from the given search results. Your answer must be precise, of high-quality, and written by an expert using an unbiased and journalistic tone. It is EXTREMELY IMPORTANT to directly answer the query. NEVER say 'based on the search results' or start your answer with a heading or title. Get straight to the point. Your answer must be written in the same language as the query, even if language preference is different. You MUST cite the most relevant search results that answer the query. Do not mention any irrelevant results. If the search results are empty or unhelpful, answer the query as well as you can with existing knowledge. You MUST NEVER use moralization or hedging language. AVOID using the following phrases - "it is important to...." - "it is inappropriate..." - "it is subjective...". You MUST ADHERE to the following formatting instructions - use markdown to format paragraphs, lists, tables and quotes whenever possible. - use headings level 2 and 3 to separate sections of your response, like "## Header", but NEVER start an answer with a heading or title of any kind (i.e. Never start with #). -Use single new lines for lists and double new lines for paragraphs. -use markdown to render images given in the search results. NEVER write URLs or links. `;
  const systemPrompt = `Here is a baseline prompt for a search assistant:\n${baselinePrompt}\n\nThe user profile is:\n- About: ${about}\n- Age: ${age}\n- Location: ${location}\n\nRewrite the baseline prompt so that it is tailored for this user. For example, if the user is a child, make the language simpler and the format easier to read. If the user is an expert, keep it technical. Output only the new tailored prompt. Keep much of the baseline prompt the same, but edit it so that it is personalised to each user. This is for a personalised search engine so tailoring is very important. Include their age, and an estimate of literacy level (if education is mentioned, include that, if not use age)`;

  const azureEndpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
  const azureApiKey = process.env.AZURE_AI_FOUNDRY_KEY;
  const azureDeployment = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4';

  if (!azureEndpoint || !azureApiKey) {
    return res.status(503).json({ error: 'Search API not configured' });
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: azureApiKey,
    baseURL: azureEndpoint,
    defaultQuery: { 'api-version': '2025-01-01-preview' },
    defaultHeaders: { 'api-key': azureApiKey },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: azureDeployment,
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const tailoredPrompt = completion.choices[0]?.message?.content?.trim();
    if (!tailoredPrompt) {
      return res.status(500).json({ error: 'No tailored prompt returned from LLM' });
    }

    // Save the tailored prompt to the user's profile in Redis
    try {
      // Update the user's prompt in the nested structure
      const updatedUsers: UserDatabase = {
        ...allUsers,
        [email]: {
          ...user,
          prompt: tailoredPrompt
        }
      };
      await redis.json.set('userdata', '$', updatedUsers);
    } catch (redisError) {
      console.error('Error saving to Redis:', redisError);
      // Continue even if Redis save fails - we still want to return the prompt
    }

    return res.status(200).json({ prompt: tailoredPrompt });
  } catch (error: any) {
    console.error('Error generating tailored prompt:', error?.response?.data || error);
    return res.status(500).json({ error: 'Failed to generate tailored prompt' });
  }
} 