import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/lib/redis';

interface FeedbackEntry {
  feedbackText: string;
  query: string;
  answer: string;
  timestamp: number;
}

interface UserData {
  feedback?: FeedbackEntry[];
  // ...other fields
}
interface UserDatabase {
  [email: string]: UserData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, feedbackText, query, answer } = req.body;
  if (!email || !feedbackText || !query || !answer) return res.status(400).json({ success: false });

  const allUsers = await redis.json.get('userdata') as UserDatabase | null;
  if (!allUsers || !allUsers[email]) return res.status(404).json({ success: false });

  // Store feedback as an array of entries
  const feedbackArr = Array.isArray(allUsers[email].feedback) ? allUsers[email].feedback : [];
  feedbackArr.push({
    feedbackText,
    query,
    answer,
    timestamp: Date.now()
  });

  allUsers[email].feedback = feedbackArr;

  await redis.json.set('userdata', '$', allUsers);

  return res.status(200).json({ success: true });
} 