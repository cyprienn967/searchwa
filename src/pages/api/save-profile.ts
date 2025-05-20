import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, inviteCode, name, age, location, about } = req.body;
  if (!email || !inviteCode || !name || !age || !location || !about) return res.status(400).json({ success: false });

  // Find and remove the old entry
  const members = await redis.smembers('1');
  let oldEntry = null;
  for (const entry of members) {
    const [entryEmail, entryInvite] = entry.split(',').map(s => s.trim());
    if (entryEmail === email && entryInvite === inviteCode) {
      oldEntry = entry;
      break;
    }
  }
  if (oldEntry) {
    await redis.srem('1', oldEntry);
  }

  // Add the new entry with all fields and flag set to true
  const newEntry = [email, inviteCode, 'true', name, age, location, about].join(', ');
  await redis.sadd('1', newEntry);

  return res.status(200).json({ success: true });
} 