import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        claims: {
          where: {
            status: 'pending',
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            claimant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
