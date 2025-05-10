import { Redis } from "@upstash/redis";

// Log Redis configuration (without exposing the token)
console.log('Redis URL configured:', !!process.env.UPSTASH_REDIS_REST_URL);
console.log('Redis Token configured:', !!process.env.UPSTASH_REDIS_REST_TOKEN);

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis configuration missing. Please check your .env.local file.');
}

// Validate Redis URL format
if (!process.env.UPSTASH_REDIS_REST_URL.startsWith('https://')) {
  throw new Error('Redis URL must start with https://');
}

// Validate Redis token
if (!process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN.length < 10) {
  throw new Error('Invalid Redis token format');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test Redis connection
redis.ping().then(() => {
  console.log('Redis connection successful');
}).catch((error) => {
  console.error('Redis connection failed:', error);
  console.error('Redis URL format:', process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://'));
  console.error('Redis Token length:', process.env.UPSTASH_REDIS_REST_TOKEN?.length);
});

export async function addToWaitlist(email: string): Promise<boolean> {
  try {
    const exists = await redis.sismember("waitlist", email);
    if (exists) {
      return false;
    }
    await redis.sadd("waitlist", email);

    await redis.hset("waitlist:timestamps", {
      [email]: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    return false;
  }
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const count = await redis.scard("waitlist");
    return count as number;
  } catch (error) {
    console.error("Error getting waitlist count:", error);
    return 0;
  }
}
