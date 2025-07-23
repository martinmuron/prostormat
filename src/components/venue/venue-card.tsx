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
    <Card className="overflow-hidden group border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 rounded-2xl">
      <Link href={`/prostory/${venue.slug}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {venueTypeLabel && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-black text-xs font-medium border-0 shadow-sm backdrop-blur-sm rounded-full px-3 py-1">
                {venueTypeLabel}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1 group-hover:text-black transition-colors">
              {venue.name}
            </h3>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="line-clamp-1">{venue.address}</span>
            </div>
          </div>
          
          {venue.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {venue.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            {(venue.capacitySeated || venue.capacityStanding) && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {venue.capacitySeated && venue.capacityStanding ? (
                    `${venue.capacitySeated}/${venue.capacityStanding}`
                  ) : venue.capacitySeated ? (
                    `${venue.capacitySeated} sed.`
                  ) : (
                    `${venue.capacityStanding} stoj.`
                  )}
                </span>
              </div>
            )}
            
            <div className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
              Zobrazit detail →
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}