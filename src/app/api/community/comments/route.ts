import { NextResponse } from 'next/server';
import { addComment, getComments } from '@/lib/comments';

// Log environment variables (without exposing the token)
console.log('API Route - Redis URL configured:', !!process.env.UPSTASH_REDIS_REST_URL);
console.log('API Route - Redis Token configured:', !!process.env.UPSTASH_REDIS_REST_TOKEN);

export async function POST(request: Request) {
  try {
    const { content, anonymousId, parentId } = await request.json();
    
    if (!content || !anonymousId) {
      return NextResponse.json(
        { error: 'Content and anonymousId are required' },
        { status: 400 }
      );
    }

    const comment = await addComment(content, anonymousId, parentId);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error in POST /api/community/comments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create comment', 
        details: error instanceof Error ? error.message : 'Unknown error',
        envCheck: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          urlFormat: process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://'),
          tokenLength: process.env.UPSTASH_REDIS_REST_TOKEN?.length
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Fetching comments...');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Redis configuration missing',
          envCheck: {
            hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
            hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
            urlFormat: process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://'),
            tokenLength: process.env.UPSTASH_REDIS_REST_TOKEN?.length
          }
        },
        { status: 500 }
      );
    }
    const comments = await getComments();
    console.log('Comments fetched:', comments.length);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error in GET /api/community/comments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch comments', 
        details: error instanceof Error ? error.message : 'Unknown error',
        envCheck: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          urlFormat: process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://'),
          tokenLength: process.env.UPSTASH_REDIS_REST_TOKEN?.length
        }
      },
      { status: 500 }
    );
  }
} 