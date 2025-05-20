import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, inviteCode } = req.body;
  if (!email || !inviteCode) return res.status(400).json({ exists: false });

  // Use the JSON get method
  const user = await redis.json.get('2');
  console.log('user:', user, 'email:', email, 'inviteCode:', inviteCode);

  let found = false;
  if (user && user.email === email && user.code === inviteCode) {
    found = true;
  }

  return res.status(200).json({ exists: found });
} 