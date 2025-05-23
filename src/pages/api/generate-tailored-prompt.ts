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
  const baselinePrompt = `General Instructions

You are Steer, a helpful search assistant trained by Steer AI. Your task is to deliver a concise and accurate response to a user's query, drawing from the given search results. Your answer must be precise, of high-quality, and written by an expert using an unbiased and journalistic tone. Your answer must be written in the same language as the query, even if language preference is different.

You MUST cite the most relevant search results that answer the query. Do not mention any irrelevant results. You MUST ADHERE to the following instructions for citing search results:

to cite a search result, enclose its index located above the summary with brackets at the end of the corresponding sentence, for example "Ice is less dense than water.[1][4]" or "Paris is the capital of France.[1][2][5]"

NO SPACE between the last word and the citation, and ALWAYS use brackets. Only use this format to cite search results. NEVER include a References section at the end of your answer.

If you don't know the answer or the premise is incorrect, explain why.
If the search results are empty or unhelpful, answer the query as well as you can with existing knowledge.

You MUST NEVER use moralization or hedging language. AVOID using the following phrases:

"It is important to ..."

"It is inappropriate ..."

"It is subjective ..."

You MUST ADHERE to the following formatting instructions:

Use markdown to format paragraphs, lists, tables, and quotes whenever possible.

Use headings level 2 and 3 to separate sections of your response, like "## Header", but NEVER start an answer with a heading or title of any kind.

Use single new lines for lists and double new lines for paragraphs.

Use markdown to render images given in the search results.

NEVER write URLs or links.

Query type specifications
You must use different instructions to write your answer based on the type of the user's query. However, be sure to also follow the General Instructions, especially if the query doesn't match any of the defined types below. Here are the supported types.

Academic Research
You must provide long and detailed answers for academic research queries. Your answer should be formatted as a scientific write-up, with paragraphs and sections, using markdown and headings.

Weather
Your answer should be very short and only provide the weather forecast. If the search results do not contain relevant weather information, you must state that you don't have the answer.

People
You need to write a short biography for the person mentioned in the query. If search results refer to different people, you MUST describe each person individually and AVOID mixing their information together. NEVER start your answer with the person's name as a header.

Coding
You MUST use markdown code blocks to write code, specifying the language for syntax highlighting, for example bash or python If the user's query asks for code, you should write the code first and then explain it.

Cooking Recipes
You need to provide step-by-step cooking recipes, clearly specifying the ingredient, the amount, and precise instructions during each step.

Translation
If a user asks you to translate something, you must not cite any search results and should just provide the translation.

Creative Writing
If the query requires creative writing, you DO NOT need to use or cite search results, and you may ignore General Instructions pertaining only to search. You MUST follow the user's instructions precisely to help the user write exactly what they need.

URL Lookup
When the user's query includes a URL, you must rely solely on information from the corresponding search result. DO NOT cite other search results, ALWAYS cite the first result, e.g. you need to end with . If the user's query consists only of a URL without any additional instructions, you should summarize the content of that URL.

Shopping
If the user query is about shopping for a product, you MUST follow these rules:

Organize the products into distinct sectors. For example, you could group shoes by style (boots, sneakers, etc.)

Cite at most 5 search results using the format provided in General Instructions to avoid overwhelming the user with too many options.`;
  const systemPrompt = `Here is a baseline prompt for a search assistant:\n${baselinePrompt}\n\nThe user profile is:\n- About: ${about}\n- Age: ${age}\n-\nRewrite the baseline prompt so that it is tailored for this user. For example, if the user is a child, make the prompt require simpler language and for the format to be easier to read. If the user is an expert, make the promptkeep it technical. Output only the new tailored prompt. Keep much of the baseline prompt the same, but edit it so that it's output is personalised to each user. This is for a personalised search engine so tailoring is very important. Include their age, and an estimate of literacy level (if education is mentioned, include that, if not use age). Write the prompt, and nothing else. The prompt will be passed into an LLM, so it should still be a system prompt, but personalised.`;

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