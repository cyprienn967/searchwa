import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user ID from the route parameter
    const userId = params.id;
    
    console.log(`GET /api/user/${userId} - Fetching user data`);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    // Special case for test user
    if (userId === 'test1') {
      console.log('Special case: Returning test user data directly');
      return NextResponse.json({
        success: true,
        user: {
          id: 'test1',
          email: 'test@example.com',
          name: 'john',
          age: '10',
          location: 'pittsburgh',
          about: 'i love learning about politics and current events and space. but i\'m not good at math and english. i want to read more.',
          interests: [],
          history: [
            {
              summary: "The capital of France is **Paris**. It is a world-famous city known for its rich history, iconic landmarks like the Eiffel Tower and Notre-Dame Cathedral, and its reputation as a center for art, fashion, and culture. Paris is often called the \"City of Light\" because it was one of the first cities in Europe to have streetlights and because it was a hub for intellectual movements like the Enlightenment.",
              timestamp: 1747843284889,
              query: "capital of france"
            }
          ]
        }
      });
    }
    
    // Get user data from Redis using the ID
    console.log(`Getting user data for ID: ${userId}`);
    const userData = await getUserById(userId);
    
    if (!userData) {
      console.log(`No user found for ID: ${userId}`);
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    console.log(`Found user with email: ${userData.email}`);
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        age: userData.age,
        location: userData.location,
        about: userData.about,
        interests: userData.interests || [],
        history: userData.history || [],
        // Do not return prompt, code, or other sensitive fields
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user data'
    }, { status: 500 });
  }
} 