import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildVenueWhereClause } from '@/lib/venue-filters'

const VENUES_PER_PAGE = 20

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const q = searchParams.get('q') || undefined
    const type = searchParams.get('type') || undefined
    const district = searchParams.get('district') || undefined
    const capacity = searchParams.get('capacity') || undefined

    const skip = (page - 1) * VENUES_PER_PAGE

    const where = buildVenueWhereClause({
      q: q ?? null,
      type: type ?? null,
      district: district ?? null,
      capacity: capacity ?? null,
    })

    const [venues, totalCount] = await Promise.all([
      db.venue.findMany({
        where,
        skip,
        take: VENUES_PER_PAGE,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          capacitySeated: true,
          capacityStanding: true,
          venueType: true,
          images: true,
          status: true,
        },
      }),
      db.venue.count({ where }),
    ])

    // Ensure images is always an array
    const venuesWithImages = venues.map((venue) => ({
      ...venue,
      images: Array.isArray(venue.images) ? venue.images : [],
    }))

    return NextResponse.json({
      venues: venuesWithImages,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / VENUES_PER_PAGE),
      hasMore: skip + venues.length < totalCount,
    })
  } catch (error) {
    console.error('Error fetching paginated venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}
