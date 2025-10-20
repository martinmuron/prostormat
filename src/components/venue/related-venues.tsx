import { db } from "@/lib/db"
import { VenueCard } from "@/components/venue/venue-card"

interface Venue {
  id: string
  name: string
  slug: string
  address: string
  district: string | null
  description?: string | null
  capacitySeated: number | null
  capacityStanding: number | null
  venueType: string | null
  images: string[]
  venueTypes?: string[]
}

async function getRelatedVenues(currentVenueId: string, venueType: string | null, address: string, amenities: string[]): Promise<Venue[]> {
  try {
    // Extract city/district from address for location matching
    const addressParts = address.split(',')
    const location = addressParts[0].trim()
    
  const venues = await db.venue.findMany({
      where: {
        AND: [
          { id: { not: currentVenueId } }, // Exclude current venue
          { status: { in: ["published", "active"] } }, // Only approved venues
          { parentId: null },
          {
            OR: [
              // Same venue type
              { venueType: venueType },
              // Same location/district
              { address: { contains: location, mode: 'insensitive' } },
              // Similar amenities (check for common amenities)
              ...(amenities.length >= 2 ? [
                {
                  amenities: {
                    hasSome: amenities.slice(0, 3) // Check for some common amenities
                  }
                }
              ] : [])
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        district: true,
        description: true,
        capacitySeated: true,
        capacityStanding: true,
        venueType: true,
        venueTypes: true,
        images: true,
      },
      take: 9, // Show up to 9 related venues
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return venues
  } catch (error) {
    console.error("Error fetching related prostormat_venues:", error)
    return []
  }
}

interface RelatedVenuesProps {
  currentVenueId: string
  venueType: string | null
  address: string
  district?: string | null
  amenities: string[]
  maxCapacity?: number
}

export async function RelatedVenues({ currentVenueId, venueType, address, district, amenities, maxCapacity }: RelatedVenuesProps) {
  const relatedVenues = await getRelatedVenues(currentVenueId, venueType, address, amenities)

  const normalizedDistrict = district?.toLowerCase().trim() ?? null
  const desiredCapacity = typeof maxCapacity === "number" && maxCapacity > 0 ? maxCapacity : null

  const prioritizedVenues = relatedVenues.filter((venue) => {
    const venueDistrict = venue.district?.toLowerCase().trim() ?? ""
    const districtMatch = normalizedDistrict ? venueDistrict === normalizedDistrict : false
    const capacity = Math.max(Number(venue.capacitySeated) || 0, Number(venue.capacityStanding) || 0)
    const capacityMatch = desiredCapacity && capacity > 0
      ? capacity >= desiredCapacity * 0.5 && capacity <= desiredCapacity * 1.5
      : false
    return districtMatch || capacityMatch
  })

  const venuesToRender = prioritizedVenues.length >= 3 ? prioritizedVenues.slice(0, 9) : relatedVenues.slice(0, 9)

  if (venuesToRender.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-title-2 text-black mb-8">Podobné prostory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venuesToRender.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={{
              id: venue.id,
              name: venue.name,
              slug: venue.slug,
              description: venue.description ?? undefined,
              address: venue.address,
              district: venue.district ?? undefined,
              capacitySeated: venue.capacitySeated,
              capacityStanding: venue.capacityStanding,
              venueType: venue.venueType,
              venueTypes: venue.venueTypes ?? [],
              images: Array.isArray(venue.images) ? venue.images : [],
            }}
          />
        ))}
      </div>
    </div>
  )
}
