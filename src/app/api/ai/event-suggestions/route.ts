import { NextRequest, NextResponse } from 'next/server';
import { generateEventSuggestions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, eventType, guestCount, budget } = body;

    if (!title || !eventType) {
      return NextResponse.json(
        { error: 'Title and event type are required' },
        { status: 400 }
      );
    }

    const suggestions = await generateEventSuggestions({
      title,
      description,
      eventType,
      guestCount,
      budget,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating event suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}