import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ history: [] }, { status: 400 });
    }
    const allUsers = await redis.json.get('userdata');
    if (!allUsers || !allUsers[email] || !allUsers[email].history) {
      return NextResponse.json({ history: [] });
    }
    return NextResponse.json({ history: allUsers[email].history });
  } catch (error) {
    return NextResponse.json({ history: [] }, { status: 500 });
  }
} 