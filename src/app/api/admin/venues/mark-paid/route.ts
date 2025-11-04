import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

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

    // Get venue details
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        manager: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Verify the admin user exists in the database
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!adminUser) {
      console.error('Admin user not found in database:', session.user.id);
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 400 }
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

    // Log the manual payment action
    try {
      await prisma.emailFlowLog.create({
        data: {
          id: nanoid(),
          emailType: 'admin_manual_payment',
          recipient: venue.manager?.email || 'unknown',
          subject: `Manual payment for venue: ${venue.name}`,
          status: 'processed',
          recipientType: 'venue_owner',
          sentBy: adminUser.id,
          createdAt: new Date(),
        },
      });
    } catch (logError) {
      // Log the error but don't fail the entire operation
      console.error('Failed to create email flow log:', logError);
    }

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
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      { error: 'Failed to mark venue as paid' },
      { status: 500 }
    );
  }
}
