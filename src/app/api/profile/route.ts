import { NextRequest, NextResponse } from 'next/server';
import { saveUserProfile, getUserByEmail, getUserIdByEmail } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // Get the user email from headers
    const email = request.headers.get('X-User-Email');
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Extract profile data
    const profileData = {
      name: body.name,
      age: body.age,
      location: body.location,
      about: body.about,
      interests: body.interests || [],
      // Don't allow direct setting of other fields like prompt, code, etc.
    };
    
    // Get existing user ID or generate a new one
    let userId = await getUserIdByEmail(email);
    if (!userId) {
      // This will create a new user entry with a generated ID
      const success = await saveUserProfile(email, {
        ...profileData,
        email
      });
      
      if (!success) {
        throw new Error('Failed to create user profile');
      }
      
      // Get the newly generated ID
      userId = await getUserIdByEmail(email);
      if (!userId) {
        throw new Error('Failed to generate user ID');
      }
    } else {
      // Update existing user profile
      const success = await saveUserProfile(email, profileData);
      if (!success) {
        throw new Error('Failed to update user profile');
      }
    }
    
    // Get the updated user data
    const userData = await getUserByEmail(email);
    
    return NextResponse.json({
      success: true,
      userId,
      user: {
        id: userData?.id,
        email: userData?.email,
        name: userData?.name,
        age: userData?.age,
        location: userData?.location,
        about: userData?.about,
        interests: userData?.interests || []
      }
    });
  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save user profile'
    }, { status: 500 });
  }
} 