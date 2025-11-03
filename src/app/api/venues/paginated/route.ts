import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { buildVenueWhereClause } from '@/lib/venue-filters'
import { sortVenuesByPriority } from '@/lib/venue-priority'
import { authOptions } from '@/lib/auth'

const VENUES_PER_PAGE = 20

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    const q = searchParams.get('q') || undefined
    const type = searchParams.get('type') || undefined
    const district = searchParams.get('district') || undefined
    const capacity = searchParams.get('capacity') || undefined
    const seedParam = searchParams.get('orderSeed')
    const parsedSeed = seedParam ? Number.parseInt(seedParam, 10) : Number.NaN
    const orderSeed = Number.isFinite(parsedSeed) ? parsedSeed : 0

    const skip = (page - 1) * VENUES_PER_PAGE
    const includeHiddenRequested = searchParams.get('includeHidden') === 'true'
    const session = includeHiddenRequested ? await getServerSession(authOptions) : null
    const visibleStatuses =
      includeHiddenRequested && session?.user?.role === 'admin'
        ? ['published', 'hidden']
        : ['published']

    const where = buildVenueWhereClause({
      q: q ?? null,
      type: type ?? null,
      district: district ?? null,
      capacity: capacity ?? null,
      statuses: visibleStatuses,
      includeSubvenues: false,
    })

    const venues = await db.venue.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        district: true,
        capacitySeated: true,
        capacityStanding: true,
        venueType: true,
        venueTypes: true,
        images: true,
        status: true,
        priority: true,
        prioritySource: true,
        homepageSlot: {
          select: {
            position: true,
          },
        },
      },
    })

    const orderedVenues = sortVenuesByPriority(venues, orderSeed)
    const totalCount = orderedVenues.length
    const currentSlice = orderedVenues.slice(skip, skip + VENUES_PER_PAGE)

    // Ensure images is always an array
    const venuesWithImages = currentSlice.map((venue) => ({
      ...venue,
      images: Array.isArray(venue.images) ? venue.images : [],
    }))

    return NextResponse.json({
      venues: venuesWithImages,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / VENUES_PER_PAGE),
      hasMore: skip + currentSlice.length < totalCount,
    })
  } catch (error) {
    console.error('Error fetching paginated venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}
