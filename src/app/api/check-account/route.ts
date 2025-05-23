import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';

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
    
    // For all other accounts, get the userdata object that contains all users
    try {
      const allUsers = await redis.json.get('userdata') as Record<string, any>;
      console.log('Looking up user:', email);
      
      if (!allUsers) {
        console.log('No userdata found in Redis');
        return NextResponse.json({ 
          success: false, 
          error: 'Account not found'
        }, { status: 404 });
      }

      const userData = allUsers[email];
      console.log('userData:', userData ? 'found' : 'not found');
      
      if (userData) {
        const isValidCode = userData.code === inviteCode;
        console.log('User exists, invite code valid:', isValidCode);
        
        if (isValidCode) {
          return NextResponse.json({ 
            success: true, 
            message: 'Account exists and invite code is valid',
            user: {
              email: email,
              id: email // Using email as ID since that's how we're storing it
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
      
    } catch (err) {
      console.error('Error looking up user:', err);
      throw err; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error checking account:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check account'
    }, { status: 500 });
  }
} 