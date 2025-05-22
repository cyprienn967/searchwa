import { NextRequest, NextResponse } from 'next/server';
import { getSearchHistory, clearSearchHistory, saveSearchHistory } from '@/lib/redis';

// GET endpoint to retrieve search history from database 2
export async function GET(request: NextRequest) {
  try {
    // Get the user email - this will be used as the key in database 2
    const email = request.headers.get('X-User-Email') || 'user123';
    
    // Parse the limit query parameter if it exists, default to 20
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    
    // Retrieve history from database 2
    const history = await getSearchHistory(email, limit);
    
    return NextResponse.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch search history' 
    }, { status: 500 });
  }
}

// POST endpoint to save a search history item to database 2
export async function POST(request: NextRequest) {
  try {
    // Get the user email - this will be used as the key in database 2
    const body = await request.json();
    const email = request.headers.get('X-User-Email') || body.email || 'user123';
    
    if (!body.query || !body.answer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Query and answer are required fields' 
      }, { status: 400 });
    }
    
    // Format matching the example - added directly to the history field in the user's profile
    const historyItem = {
      query: body.query,
      answer: body.answer,
      timestamp: Date.now()
    };
    
    // Save directly to the history field in the user profile in database 2
    const result = await saveSearchHistory(email, historyItem);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        id: result.id 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save search history' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save search history' 
    }, { status: 500 });
  }
}

// DELETE endpoint to clear search history from database 2
export async function DELETE(request: NextRequest) {
  try {
    // Get the user email - this will be used as the key in database 2
    const email = request.headers.get('X-User-Email') || 'user123';
    
    // Clear history in database 2
    const success = await clearSearchHistory(email);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to clear search history' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error clearing search history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear search history' 
    }, { status: 500 });
  }
} 