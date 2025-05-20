import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ flag: false });

  // Find the user's entry in the set
  const members = await redis.smembers('1');
  let flag = false;
  for (const entry of members) {
    const [entryEmail, , entryFlag] = entry.split(',').map(s => s.trim());
    if (entryEmail === email) {
      flag = entryFlag === 'true';
      break;
    }
  }
  return res.status(200).json({ flag });
} 