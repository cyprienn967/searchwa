import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ flag: false });

  // Get all users from Redis
  const allUsers = await redis.json.get('userdata');
  let flag = false;
  if (allUsers && allUsers[email]) {
    flag = !!allUsers[email].flag;
  }
  return res.status(200).json({ flag });
} 