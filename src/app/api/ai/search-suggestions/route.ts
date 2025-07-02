import { NextRequest, NextResponse } from 'next/server';
import { generateSearchSuggestions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const suggestions = await generateSearchSuggestions(query);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}