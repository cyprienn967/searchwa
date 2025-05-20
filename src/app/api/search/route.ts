import { NextRequest, NextResponse } from 'next/server';
import Exa from 'exa-js';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';

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

export async function POST(request: NextRequest) {
  try {
    const { query, userContext } = await request.json();

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const exaApiKey = process.env.EXA_API_KEY;
    const azureEndpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
    const azureApiKey = process.env.AZURE_AI_FOUNDRY_KEY;
    const azureDeployment = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o';

    if (!exaApiKey || !azureEndpoint || !azureApiKey) {
      return NextResponse.json(
        { error: 'Search API not configured' },
        { status: 503 }
      );
    }

    // Get user's personalized prompt from Redis
    const userEmail = userContext?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Get the user's data from the nested structure (now using key '2')
    const allUsers = await redis.json.get('2') as UserDatabase | null;
    if (!allUsers) {
      return NextResponse.json(
        { error: 'No users found in database' },
        { status: 404 }
      );
    }

    const userData = allUsers[userEmail];
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userPrompt = userData.prompt || '';

    // Extract the actual search query if it's a structured prompt
    let actualSearchQuery = query;
    const userQuestionMatch = query.match(/USER QUESTION:\s*(.*?)(\n|$)/);
    if (userQuestionMatch && userQuestionMatch[1]) {
      actualSearchQuery = userQuestionMatch[1].trim();
    }

    const exa = new Exa(exaApiKey);
    const openai = new OpenAI({
      apiKey: azureApiKey,
      baseURL: azureEndpoint,
      defaultQuery: { 'api-version': '2025-01-01-preview' },
      defaultHeaders: { 'api-key': azureApiKey },
    });
    
    // Get search results from Exa using the actual query, not the prompt
    const searchResults = await exa.searchAndContents(actualSearchQuery, {
      text: { "maxCharacters": 8000 }
    });

    // Format the search results into a context for the AI
    const searchContext = searchResults.results.map(result => ({
      title: result.title,
      content: result.text || '',
      url: result.url
    }));

    // Format the search results to send first
    const formattedResults = {
      results: searchResults.results.map(result => ({
        title: result.title,
        url: result.url,
        displayUrl: new URL(result.url).hostname,
        snippet: result.text?.substring(0, 200) + '...' || '',
        summary: result.text || ''
      }))
    };

    // Create a system prompt that emphasizes focusing on the user's question
    const baseSystemPrompt = userPrompt || `You are a personalized search assistant that summarizes search results in a comprehensive, informative manner similar to Perplexity.

You will be given the text content from multiple search results for a query. 
Your task is to create ONE unified, coherent summary that synthesizes information from all sources.

INSTRUCTIONS:
1. Create a comprehensive summary that addresses the search query directly.
2. Incorporate information from multiple sources, highlighting key points, facts, and insights.
3. Structure the summary logically, including an introduction, main points, and conclusion.
4. Use an informative, objective tone like Perplexity.
5. Do not list individual sources separately - create one unified summary.
6. Format your response with proper headings and paragraph spacing.
7. Ensure adequate whitespace between sections for maximum readability.
8. Keep responses concise while retaining all important information.
9. Use emojis, dot-jots, and other formatting only when appropriate. Do not rely on them beyond what is necessary.
10. IMPORTANT: Your primary task is to answer the user's specific question using the search results provided.`;

    // Create text encoder for the stream
    const encoder = new TextEncoder();

    // Create a readable stream for our response
    const stream = new ReadableStream({
      async start(controller) {
        // First, send the search results
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'results', data: formattedResults }) + '\n'));

        try {
          // Create the streaming response from OpenAI
          const completion = await openai.chat.completions.create({
            model: azureDeployment,
            messages: [
              {
                role: "system",
                content: baseSystemPrompt
              },
              {
                role: "user",
                content: query.includes("USER QUESTION:") 
                  ? query 
                  : `Search Query: "${query}"
      
Below are the combined contents from multiple search results:
      
${JSON.stringify(searchContext, null, 2)}
      
Please provide ONE comprehensive summary that synthesizes information from all these sources to directly answer the search query.`
              }
            ],
            max_tokens: 1500,
            temperature: 0.4,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true
          });
          
          // Process the streaming response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'chunk', data: content }) + '\n'));
            }
          }
        } catch (error) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', data: 'Error generating response' }) + '\n'));
          console.error('Streaming error:', error);
        } finally {
          controller.close();
        }
      }
    });

    // Return the stream with the appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 