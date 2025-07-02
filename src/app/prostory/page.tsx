import { Suspense } from "react"
import { VenueCard } from "@/components/venue/venue-card"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { VENUE_TYPES, PRAGUE_DISTRICTS, CAPACITY_RANGES } from "@/types"
import { Search } from "lucide-react"

interface SearchParams {
  q?: string
  type?: string
  district?: string
  capacity?: string
}

async function getVenues(searchParams: SearchParams) {
  try {
    const where: any = {
      status: "active",
    }

    // Search query
    if (searchParams.q) {
      where.OR = [
        { name: { contains: searchParams.q, mode: 'insensitive' } },
        { description: { contains: searchParams.q, mode: 'insensitive' } },
        { address: { contains: searchParams.q, mode: 'insensitive' } },
      ]
    }

    // Venue type filter
    if (searchParams.type) {
      where.venueType = searchParams.type
    }

    // District filter
    if (searchParams.district) {
      where.address = {
        contains: searchParams.district,
        mode: 'insensitive'
      }
    }

    // Capacity filter
    if (searchParams.capacity) {
      const capacityRanges: { [key: string]: any } = {
        'Do 25 lidí': { OR: [{ capacitySeated: { lte: 25 } }, { capacityStanding: { lte: 25 } }] },
        '25 - 50 lidí': { OR: [
          { capacitySeated: { gte: 25, lte: 50 } },
          { capacityStanding: { gte: 25, lte: 50 } }
        ]},
        '50 - 100 lidí': { OR: [
          { capacitySeated: { gte: 50, lte: 100 } },
          { capacityStanding: { gte: 50, lte: 100 } }
        ]},
        '100 - 200 lidí': { OR: [
          { capacitySeated: { gte: 100, lte: 200 } },
          { capacityStanding: { gte: 100, lte: 200 } }
        ]},
        'Nad 200 lidí': { OR: [
          { capacitySeated: { gte: 200 } },
          { capacityStanding: { gte: 200 } }
        ]},
      }

      if (capacityRanges[searchParams.capacity]) {
        Object.assign(where, capacityRanges[searchParams.capacity])
      }
    }

    const venues = await db.venue.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return venues
  } catch (error) {
    console.error("Error fetching venues:", error)
    return []
  }
}

function VenueGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-full" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function VenueGrid({ searchParams }: { searchParams: SearchParams }) {
  const venues = await getVenues(searchParams)

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-3 text-black mb-4">Žádné prostory nebyly nalezeny</h3>
        <p className="text-body text-gray-600 mb-6">
          Zkuste upravit filtry nebo vyhledat jiné prostory.
        </p>
        <Button asChild>
          <a href="/prostory">Zobrazit všechny prostory</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {venues.map((venue: any) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-title-1 text-black mb-6">Event prostory v Praze</h1>
          
          {/* Search and Filters */}
          <form method="GET" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                name="q"
                defaultValue={resolvedSearchParams.q}
                className="pl-12"
                placeholder="Hledat prostory podle názvu, popisu nebo adresy..."
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select name="type" defaultValue={resolvedSearchParams.type}>
                <option value="">Všechny typy</option>
                {Object.entries(VENUE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>

              <Select name="district" defaultValue={resolvedSearchParams.district}>
                <option value="">Všechny lokality</option>
                {PRAGUE_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </Select>

              <Select name="capacity" defaultValue={resolvedSearchParams.capacity}>
                <option value="">Všechny kapacity</option>
                {CAPACITY_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </Select>

              <Button type="submit" className="w-full">
                Filtrovat
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Venue Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Suspense fallback={<VenueGridSkeleton />}>
          <VenueGrid searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  )
}