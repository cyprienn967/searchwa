import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, inviteCode, name, age, location, about } = req.body;
  if (!email || !inviteCode || !name || !age || !location || !about) return res.status(400).json({ success: false });

  // Get the current user JSON object at key '2'
  const user = await redis.json.get('2');

  // Prepare the updated user object, preserving feedback and interests if present
  const updatedUser = {
    email,
    code: inviteCode,
    flag: true,
    name,
    age,
    location,
    interests: user?.interests || [],
    feedback: user?.feedback || {},
    prompt: user?.prompt || '',
    about
  };

  await redis.json.set('2', '$', updatedUser);

  return res.status(200).json({ success: true });
} 