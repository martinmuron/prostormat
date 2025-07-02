import { NextRequest, NextResponse } from 'next/server';
import { generateVenueDescription } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, capacity, venueType, amenities } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    const description = await generateVenueDescription({
      name,
      address,
      capacity,
      venueType,
      amenities,
    });

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating venue description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}