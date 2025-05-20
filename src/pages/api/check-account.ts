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
  const { email, inviteCode } = req.body;
  if (!email || !inviteCode) return res.status(400).json({ exists: false });

  try {
    // Get all users from Redis (now using key '2')
    const allUsers = await redis.json.get('2') as UserDatabase | null;
    console.log('user:', allUsers, 'email:', email, 'inviteCode:', inviteCode);

    if (!allUsers) {
      return res.status(200).json({ exists: false });
    }

    // Check if user exists and invite code matches
    const user = allUsers[email];
    const exists = user && user.code === inviteCode;

    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking account:', error);
    return res.status(500).json({ exists: false });
  }
} 