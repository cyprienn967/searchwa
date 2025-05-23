import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

interface UserData {
  about: string;
  age: string | number;
  code: string;
  flag: boolean;
  interests: string[];
  name: string;
  prompt: string;
  feedback: any[];
  location: string;
}

interface UserDatabase {
  [email: string]: UserData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, inviteCode, name, age, about, location, interests, feedback, flag, prompt } = body;
    
    if (!email || !inviteCode || !name || !age || !about || !location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get all users from Redis
    let allUsers: UserDatabase | null = null;
    try {
      allUsers = await redis.json.get('userdata') as UserDatabase | null;
    } catch (error) {
      // If the key doesn't exist or isn't a JSON, initialize it
      await redis.json.set('userdata', '$', {});
      allUsers = {};
    }
    
    // If allUsers is still null after initialization, create an empty object
    if (!allUsers) {
      allUsers = {};
    }
    
    // Prepare the updated user object
    const updatedUser: UserData = {
      code: inviteCode,
      flag: flag ?? false,
      name,
      age,
      location,
      about,
      interests: interests || [],
      feedback: feedback || [],
      prompt: prompt || ''
    };

    // Update the users object with the new user data
    const updatedUsers: UserDatabase = {
      ...allUsers,
      [email]: updatedUser
    };

    // Save the updated users object back to Redis
    await redis.json.set('userdata', '$', updatedUsers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save profile' 
    }, { status: 500 });
  }
} 