import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, inviteCode } = req.body;
  if (!email || !inviteCode) return res.status(400).json({ exists: false });

  // Get all members of the set with key '1'
  const members = await redis.smembers('1');
  let found = false;
  for (const entry of members) {
    const [entryEmail, entryInvite] = entry.split(',').map(s => s.trim());
    console.log('Comparing:', { entryEmail, entryInvite, submittedEmail: email, submittedInvite: inviteCode });
    if (entryEmail === email && entryInvite === inviteCode) {
      found = true;
      break;
    }
  }

  return res.status(200).json({ exists: found });
} 