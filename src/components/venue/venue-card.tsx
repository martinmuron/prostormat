import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { MapPin, Users } from "lucide-react"

interface VenueCardProps {
  venue: {
    id: string
    name: string
    slug: string
    description?: string | null
    address: string
    capacitySeated?: number | null
    capacityStanding?: number | null
    venueType?: string | null
    images: string[]
  }
}

export function VenueCard({ venue }: VenueCardProps) {
  // Parse images from JSON string (SQLite format) or use as array (PostgreSQL format)
  let images: string[] = []
  try {
    if (typeof venue.images === 'string') {
      images = JSON.parse(venue.images)
    } else if (Array.isArray(venue.images)) {
      images = venue.images
    }
  } catch (error) {
    console.warn('Failed to parse venue images:', error)
    images = []
  }
  
  const mainImage = (Array.isArray(images) && images.length > 0 ? images[0] : null) || "/images/placeholder-venue.jpg"
  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : null

  return (
    <Card className="overflow-hidden group border border-gray-200 bg-white hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-500 ease-out rounded-2xl">
      <Link href={`/prostory/${venue.slug}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {venueTypeLabel && (
            <div className="absolute top-3 left-3 transform group-hover:scale-105 transition-transform duration-300">
              <Badge variant="secondary" className="bg-white/95 text-black text-xs font-medium border-0 shadow-lg backdrop-blur-sm rounded-full px-3 py-1.5">
                {venueTypeLabel}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3 text-center">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-1 group-hover:text-black transition-colors duration-300">
              {venue.name}
            </h3>
            
            <div className="flex items-center justify-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{venue.address}</span>
            </div>
          </div>
          
          {venue.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
              {venue.description}
            </p>
          )}
          
          <div className="pt-3 border-t border-gray-100">
            {(venue.capacitySeated || venue.capacityStanding) && (
              <div className="flex items-center justify-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-3">
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium">
                  {venue.capacitySeated && venue.capacityStanding ? (
                    `${venue.capacitySeated} sed. / ${venue.capacityStanding} stoj.`
                  ) : venue.capacitySeated ? (
                    `${venue.capacitySeated} k sezení`
                  ) : (
                    `${venue.capacityStanding} k stání`
                  )}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <div className="inline-flex items-center text-sm font-medium text-gray-500 group-hover:text-black transition-all duration-300 group-hover:gap-2 gap-1">
                <span>Zobrazit detail</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}