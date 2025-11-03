import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchRandomizedVenuePage, getCurrentSeed } from '@/lib/venue-order'

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

    const skip = (page - 1) * VENUES_PER_PAGE
    const includeHiddenRequested = searchParams.get('includeHidden') === 'true'
    const session = includeHiddenRequested ? await getServerSession(authOptions) : null
    const visibleStatuses =
      includeHiddenRequested && session?.user?.role === 'admin'
        ? ['published', 'hidden']
        : ['published']

    const seedParam = searchParams.get('seed')
    const parsedSeed = seedParam ? Number.parseInt(seedParam, 10) : NaN
    const effectiveSeed = Number.isFinite(parsedSeed) ? parsedSeed : getCurrentSeed()

    const { venues, totalCount, hasMore } = await fetchRandomizedVenuePage({
      filters: {
        q: q ?? null,
        type: type ?? null,
        district: district ?? null,
        capacity: capacity ?? null,
        statuses: visibleStatuses,
        includeSubvenues: false,
      },
      seed: effectiveSeed,
      take: VENUES_PER_PAGE,
      skip,
    })

    const venuesWithImages = venues.map((venue) => ({
      ...venue,
      images: Array.isArray(venue.images) ? venue.images : [],
    }))

    return NextResponse.json({
      venues: venuesWithImages,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / VENUES_PER_PAGE),
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching paginated venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}
