import { Suspense } from "react"
import { VenueFilters } from "@/components/venue/venue-filters"
import { InfiniteVenueList } from "@/components/venue/infinite-venue-list"
import { db } from "@/lib/db"
import { buildVenueWhereClause } from "@/lib/venue-filters"
import { generateOrderSeed, sortVenuesByPriority } from "@/lib/venue-priority"

interface SearchParams {
  q?: string
  type?: string
  district?: string
  capacity?: string
}

const VENUES_PER_PAGE = 20

async function getInitialVenues(searchParams: SearchParams, orderSeed: number) {
  try {
    const where = buildVenueWhereClause({
      q: searchParams.q ?? null,
      type: searchParams.type ?? null,
      district: searchParams.district ?? null,
      capacity: searchParams.capacity ?? null,
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
        capacitySeated: true,
        capacityStanding: true,
        venueType: true,
        venueTypes: true,
        images: true,
        status: true,
        priority: true,
      }
    })

    const orderedVenues = sortVenuesByPriority(venues, orderSeed)
    const initialVenues = orderedVenues.slice(0, VENUES_PER_PAGE)
    const totalCount = orderedVenues.length

    // Ensure images is always an array
    return {
      venues: initialVenues.map(venue => ({
        ...venue,
        images: Array.isArray(venue.images) ? venue.images : []
      })),
      totalCount,
      hasMore: totalCount > VENUES_PER_PAGE
    }
  } catch (error) {
    console.error("Error fetching prostormat_venues:", error)
    return { venues: [], totalCount: 0, hasMore: false }
  }
}

function VenueGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
          <div className="p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-4 w-full" />
            <div className="flex justify-between">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function VenueContent({ searchParams, orderSeed }: { searchParams: SearchParams, orderSeed: number }) {
  const { venues, totalCount, hasMore } = await getInitialVenues(searchParams, orderSeed)

  if (venues.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h3 className="text-lg sm:text-title-3 text-black mb-3 sm:mb-4">
          Žádné prostory nebyly nalezeny
        </h3>
        <p className="text-sm sm:text-body text-gray-600 mb-4 sm:mb-6">
          Zkuste upravit filtry nebo vyhledat jiné prostory.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 text-center text-sm text-gray-600">
        Zobrazeno {venues.length} z {totalCount} prostor
      </div>
      <InfiniteVenueList
        initialVenues={venues}
        searchParams={searchParams}
        hasMore={hasMore}
        orderSeed={orderSeed}
      />
    </>
  )
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const orderSeed = generateOrderSeed()
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-black mb-6 sm:mb-8 font-semibold tracking-tight">
              Event prostory v Praze
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <VenueFilters initialValues={resolvedSearchParams} />
            </div>
          </div>
        </div>
      </div>

      {/* Venue Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<VenueGridSkeleton />}>
          <VenueContent searchParams={resolvedSearchParams} orderSeed={orderSeed} />
        </Suspense>
      </div>
    </div>
  )
}
