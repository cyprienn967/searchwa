import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Get all users from Redis
    const allUsers = await redis.json.get('userdata');
    
    if (!allUsers || !allUsers[email]) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Return only the necessary user data
    return NextResponse.json({
      success: true,
      data: {
        name: allUsers[email].name || '',
        email: email
      }
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get user data'
    }, { status: 500 });
  }
} 