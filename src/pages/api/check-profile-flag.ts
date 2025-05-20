import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ flag: false });

  // Use the JSON get method
  const user = await redis.json.get('2');
  let flag = false;
  if (user && user.email === email) {
    flag = !!user.flag;
  }
  return res.status(200).json({ flag });
} 