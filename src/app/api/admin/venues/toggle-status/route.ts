import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { venueId, status } = await request.json();

    if (!venueId || !status) {
      return NextResponse.json(
        { error: 'Venue ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['published', 'hidden', 'draft', 'pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: published, hidden, draft, pending' },
        { status: 400 }
      );
    }

    // Get venue details to verify it exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Update venue status
    await prisma.venue.update({
      where: { id: venueId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Venue status updated to ${status}`,
      success: true,
      venueId,
      newStatus: status,
    });

  } catch (error) {
    console.error('Error updating venue status:', error);
    return NextResponse.json(
      { error: 'Failed to update venue status' },
      { status: 500 }
    );
  }
}