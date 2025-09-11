import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all venues (not just pending ones)
    const venues = await prisma.venue.findMany({
      include: {
        manager: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      venues,
      count: venues.length,
    });

  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}