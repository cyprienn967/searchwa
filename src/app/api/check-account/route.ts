import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, inviteCode } = body;
    
    console.log('user:', null, 'email:', email, 'inviteCode:', inviteCode);
    
    // Special case for test@example.com
    if (email === 'test@example.com') {
      console.log('Test account detected, checking test user');
      
      // For test@example.com, always accept the hardcoded invite code
      if (inviteCode === 'STEER-2025') {
        console.log('Test account with valid invite code');
        return NextResponse.json({ 
          success: true, 
          message: 'Account exists and invite code is valid',
          user: {
            email: 'test@example.com',
            id: 'test1'
          }
        });
      }
    }
    
    // For all other accounts, check if they exist using the updated functions
    const userData = await getUserByEmail(email);
    console.log('userData:', userData ? 'found' : 'not found');
    
    // Check if user exists and the invite code matches
    if (userData) {
      const isValidCode = userData.code === inviteCode;
      console.log('User exists, invite code valid:', isValidCode);
      
      if (isValidCode) {
        return NextResponse.json({ 
          success: true, 
          message: 'Account exists and invite code is valid',
          user: {
            email: userData.email,
            id: userData.id || 'user1'
          }
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid invite code'
        }, { status: 401 });
      }
    }
    
    // User not found, return error
    console.log('User not found');
    return NextResponse.json({ 
      success: false, 
      error: 'Account not found'
    }, { status: 404 });
  } catch (error) {
    console.error('Error checking account:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check account'
    }, { status: 500 });
  }
} 