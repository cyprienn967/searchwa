import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, inviteCode, name, age, location, about } = req.body;
  if (!email || !inviteCode || !name || !age || !location || !about) return res.status(400).json({ success: false });

  try {
    // Get all users from Redis (now using key '2')
    const allUsers = await redis.json.get('userdata') as UserDatabase | null;
    
    // Prepare the updated user object
    const updatedUser: UserData = {
      code: inviteCode,
      flag: true,
      name,
      age,
      location,
      interests: allUsers?.[email]?.interests || [],
      feedback: allUsers?.[email]?.feedback || {},
      prompt: allUsers?.[email]?.prompt || '',
      about
    };

    // Update the users object with the new user data
    const updatedUsers: UserDatabase = {
      ...(allUsers || {}),
      [email]: updatedUser
    };

    // Save the updated users object back to Redis (now using key '2')
    await redis.json.set('userdata', '$', updatedUsers);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ success: false });
  }
} 