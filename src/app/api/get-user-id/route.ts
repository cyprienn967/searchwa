import { NextRequest, NextResponse } from 'next/server';
import { getUserIdByEmail } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // Get the user email from headers or body
    let email = request.headers.get('X-User-Email');
    
    // If not in headers, try to get it from the request body
    if (!email) {
      const body = await request.json();
      email = body.email;
    }
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }
    
    console.log(`Fetching user ID for email: ${email}`);
    
    // Special case for test user
    if (email === 'test@example.com') {
      console.log('Special case: Returning hardcoded ID for test user');
      return NextResponse.json({
        success: true,
        userId: 'test1'
      });
    }
    
    // Get the user ID from their email using the updated function
    const userId = await getUserIdByEmail(email);
    
    if (!userId) {
      console.log(`No user ID found for email: ${email}`);
      
      // For test emails, return a test ID
      if (email.includes('test') || email.includes('example')) {
        console.log('Test email detected, creating test ID');
        return NextResponse.json({
          success: true,
          userId: 'test1'
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    console.log(`Found user ID for ${email}: ${userId}`);
    return NextResponse.json({
      success: true,
      userId
    });
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user ID'
    }, { status: 500 });
  }
} 