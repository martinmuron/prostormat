import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { venueId, paymentDate } = await request.json();

    if (!venueId || !paymentDate) {
      return NextResponse.json(
        { error: 'Venue ID and payment date are required' },
        { status: 400 }
      );
    }

    // Parse payment date
    const parsedPaymentDate = new Date(paymentDate);
    if (isNaN(parsedPaymentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid payment date' },
        { status: 400 }
      );
    }

    // Calculate expiry date (1 year from payment date)
    const expiresAt = new Date(parsedPaymentDate);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Update venue with payment information
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: {
        paid: true,
        paymentDate: parsedPaymentDate,
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Venue marked as paid successfully',
      venue: {
        id: updatedVenue.id,
        name: updatedVenue.name,
        paid: true,
        paymentDate: parsedPaymentDate,
        expiresAt: expiresAt,
      },
    });

  } catch (error) {
    console.error('Error marking venue as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark venue as paid' },
      { status: 500 }
    );
  }
}
