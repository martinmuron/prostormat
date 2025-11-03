import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

const PUBLIC_STATUSES = ['published'];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawQuery = url.searchParams.get('q') ?? '';
    const trimmed = rawQuery.trim();

    if (!trimmed) {
      return NextResponse.json({ venues: [] });
    }

    if (trimmed.length > 100) {
      return NextResponse.json(
        { error: 'Search term is too long.' },
        { status: 400 }
      );
    }

    const venues = await db.venue.findMany({
      where: {
        status: { in: PUBLIC_STATUSES },
        name: {
          contains: trimmed,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        district: true,
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' },
      ],
      take: 8,
    });

    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Failed to fetch venue suggestions:', error);
    return NextResponse.json(
      { venues: [] },
      { status: 500 }
    );
  }
}
