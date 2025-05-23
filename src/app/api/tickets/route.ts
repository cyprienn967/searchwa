import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // Get user email and message
    const body = await request.json();
    const userEmail = request.headers.get('X-User-Email') || body.email;
    const { message } = body;
    
    if (!userEmail || !message) {
      return NextResponse.json({
        success: false,
        error: 'Email and message are required'
      }, { status: 400 });
    }
    
    console.log(`New ticket from ${userEmail}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    
    // Create ticket object with timestamp and unique ID
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const ticket = {
      id: ticketId,
      email: userEmail,
      message,
      timestamp: Date.now(),
      status: 'new'
    };
    
    // Save to "tickets" list in Redis database 2
    // First, get the existing tickets array or create a new one
    const existingTicketsData = await redis.get('tickets');
    let tickets = [];
    
    if (existingTicketsData) {
      try {
        tickets = typeof existingTicketsData === 'string' 
          ? JSON.parse(existingTicketsData) 
          : existingTicketsData;
          
        if (!Array.isArray(tickets)) {
          console.log('Tickets data is not an array, creating new array');
          tickets = [];
        }
      } catch (error) {
        console.error('Error parsing tickets data:', error);
        tickets = [];
      }
    }
    
    // Add the new ticket
    tickets.push(ticket);
    console.log(`Adding ticket ${ticketId} to tickets collection, now has ${tickets.length} entries`);
    
    // Save back to Redis
    await redis.set('tickets', JSON.stringify(tickets));
    
    // Also add to user's record if available
    try {
      const userData = await redis.get(userEmail);
      
      if (userData) {
        const userObject = typeof userData === 'string' ? JSON.parse(userData) : userData;
        
        // Ensure feedback array exists
        if (!Array.isArray(userObject.feedback)) {
          userObject.feedback = [];
        }
        
        // Add ticket to user's feedback array
        userObject.feedback.push({
          ticketId,
          message,
          timestamp: ticket.timestamp
        });
        
        // Save updated user data
        await redis.set(userEmail, JSON.stringify(userObject));
        console.log(`Added ticket reference to user's feedback array`);
      }
    } catch (userError) {
      console.error('Error adding ticket to user record:', userError);
      // Continue even if this part fails
    }
    
    return NextResponse.json({
      success: true,
      ticketId
    });
  } catch (error) {
    console.error('Error saving ticket:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save ticket'
    }, { status: 500 });
  }
} 