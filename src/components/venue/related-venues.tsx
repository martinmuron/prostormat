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

interface VenueWithScore extends Venue {
  relevanceScore: number
}

function calculateRelevanceScore(
  venue: Venue,
  targetVenueType: string | null,
  targetDistrict: string | null,
  targetLocation: string,
  targetCapacity: number
): number {
  let score = 0

  // Same venue type = 100 points (HIGHEST PRIORITY)
  if (venue.venueType && targetVenueType && venue.venueType === targetVenueType) {
    score += 100
  }

  // Capacity within 50-150% range = 50 points
  const venueCapacity = Math.max(Number(venue.capacitySeated) || 0, Number(venue.capacityStanding) || 0)
  if (targetCapacity > 0 && venueCapacity > 0) {
    if (venueCapacity >= targetCapacity * 0.5 && venueCapacity <= targetCapacity * 1.5) {
      score += 50
    }
  }

  // Same district = 50 points
  const normalizedVenueDistrict = venue.district?.toLowerCase().trim() ?? ""
  const normalizedTargetDistrict = targetDistrict?.toLowerCase().trim() ?? ""
  if (normalizedVenueDistrict && normalizedTargetDistrict && normalizedVenueDistrict === normalizedTargetDistrict) {
    score += 50
  }

  // Address contains same location = 25 points
  if (targetLocation && venue.address.toLowerCase().includes(targetLocation.toLowerCase())) {
    score += 25
  }

  return score
}

async function getRelatedVenues(
  currentVenueId: string,
  venueType: string | null,
  address: string,
  district: string | null,
  maxCapacity: number
): Promise<Venue[]> {
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
              // Same district
              { district: district },
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
      // Fetch all matching venues for accurate scoring
    })

    // Calculate relevance score for each venue
    const venuesWithScores: VenueWithScore[] = venues.map(venue => ({
      ...venue,
      relevanceScore: calculateRelevanceScore(venue, venueType, district, location, maxCapacity)
    }))

    // Sort by relevance score (highest first)
    venuesWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Return top 9 most relevant venues
    return venuesWithScores.slice(0, 9)
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
  maxCapacity?: number
}

export async function RelatedVenues({ currentVenueId, venueType, address, district, maxCapacity }: RelatedVenuesProps) {
  const desiredCapacity = typeof maxCapacity === "number" && maxCapacity > 0 ? maxCapacity : 0

  const relatedVenues = await getRelatedVenues(currentVenueId, venueType, address, district ?? null, desiredCapacity)

  if (relatedVenues.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-title-2 text-black mb-8">Podobné prostory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedVenues.map((venue) => (
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
