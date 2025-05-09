import { NextRequest, NextResponse } from 'next/server';
import Exa from 'exa-js';
import OpenAI from 'openai';

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

    // Create a system prompt that emphasizes focusing on the user's question
    const baseSystemPrompt = `You are a personalized search assistant that summarizes search results in a comprehensive, informative manner similar to Perplexity.

You will be given the text content from multiple search results for a query. 
Your task is to create ONE unified, coherent summary that synthesizes information from all sources.

INSTRUCTIONS:
1. Create a comprehensive summary that addresses the search query directly.
2. Incorporate information from multiple sources, highlighting key points, facts, and insights.
3. Structure the summary logically, with a clear introduction, main points, and conclusion.
4. Use an informative, objective tone like Perplexity.
5. Do not list individual sources separately - create one unified summary.
6. Format your response with proper headings and paragraph spacing.
7. Ensure adequate whitespace between sections for maximum readability.
8. Keep responses concise while retaining all important information.
9. IMPORTANT: Your primary task is to answer the user's specific question using the search results provided.`;

    // Generate a clean summary using Azure OpenAI
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
      presence_penalty: 0
    });
    
    // Format results to match the expected structure
    const formattedResults = {
      results: searchResults.results.map(result => ({
        title: result.title,
        url: result.url,
        displayUrl: new URL(result.url).hostname,
        snippet: result.text?.substring(0, 200) + '...' || '',
        summary: result.text || ''
      })),
      answer: completion.choices[0].message.content
    };

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 