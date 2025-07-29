import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeartButton } from "@/components/venue/heart-button"
import { db } from "@/lib/db"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { MapPin, Users } from "lucide-react"

interface Venue {
  id: string
  name: string
  slug: string
  address: string
  capacitySeated: number | null
  capacityStanding: number | null
  venueType: string | null
  images: string[]
  amenities: string[]
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
          { status: "active" }, // Only active venues
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
        capacitySeated: true,
        capacityStanding: true,
        venueType: true,
        images: true,
        amenities: true,
      },
      take: 8, // Show up to 8 related venues
      orderBy: [
        { isRecommended: 'desc' }, // Recommended venues first
        { createdAt: 'desc' }
      ]
    })

    return venues
  } catch (error) {
    console.error("Error fetching related venues:", error)
    return []
  }
}

interface RelatedVenuesProps {
  currentVenueId: string
  venueType: string | null
  address: string
  amenities: string[]
}

export async function RelatedVenues({ currentVenueId, venueType, address, amenities }: RelatedVenuesProps) {
  const relatedVenues = await getRelatedVenues(currentVenueId, venueType, address, amenities)

  if (relatedVenues.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-title-2 text-black mb-8">Podobné prostory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedVenues.map((venue) => {
          const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : null
          const totalCapacity = Math.max(venue.capacitySeated || 0, venue.capacityStanding || 0)
          
          return (
            <Card key={venue.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative">
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg overflow-hidden">
                  {venue.images.length > 0 ? (
                    <img
                      src={venue.images[0]}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <span className="text-sm">Bez obrázku</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Heart Button */}
                <div className="absolute top-3 right-3">
                  <HeartButton venueId={venue.id} size="sm" className="bg-white/90 backdrop-blur-sm" />
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <Link href={`/prostory/${venue.slug}`}>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {venue.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </div>
                </div>

                {/* Venue Type and Capacity */}
                <div className="flex items-center justify-between mb-3">
                  {venueTypeLabel && (
                    <Badge variant="outline" className="text-xs">
                      {venueTypeLabel}
                    </Badge>
                  )}
                  {totalCapacity > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{totalCapacity}</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{venue.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <Link href={`/prostory/${venue.slug}`} className="mt-auto">
                  <div className="mt-3">
                    <div className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium rounded-xl px-4 py-2 text-center text-sm group cursor-pointer">
                      <span>Zobrazit detaily</span>
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}