import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 403 }
      );
    }

    const { venueId, paid } = await request.json();

    if (!venueId || typeof paid !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: venueId and paid' },
        { status: 400 }
      );
    }

    // Update venue paid status
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: {
        paid,
        paymentDate: paid ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        paid: true,
        paymentDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      paid: updatedVenue.paid,
      paymentDate: updatedVenue.paymentDate,
      message: paid
        ? `Prostor "${updatedVenue.name}" byl označen jako zaplacený`
        : `Platba prostoru "${updatedVenue.name}" byla zrušena`,
    });
  } catch (error) {
    console.error('Error toggling venue paid status:', error);
    return NextResponse.json(
      { error: 'Failed to update venue paid status' },
      { status: 500 }
    );
  }
}
