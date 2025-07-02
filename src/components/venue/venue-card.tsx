import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"

interface VenueCardProps {
  venue: {
    id: string
    name: string
    slug: string
    description?: string | null
    address: string
    capacitySeated?: number | null
    capacityStanding?: number | null
    priceRange?: string | null
    venueType?: string | null
    images: string[]
  }
}

export function VenueCard({ venue }: VenueCardProps) {
  const mainImage = venue.images[0] || "/images/placeholder-venue.jpg"
  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/prostory/${venue.slug}`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={mainImage}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {venueTypeLabel && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <Badge variant="secondary" className="bg-white/90 text-black text-xs sm:text-sm">
                {venueTypeLabel}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-title-3 text-black mb-2 group-hover:text-gray-700 transition-colors leading-tight">
            {venue.name}
          </h3>
          
          <p className="text-sm sm:text-callout text-gray-500 mb-3 line-clamp-2">
            {venue.address}
          </p>
          
          {venue.description && (
            <p className="text-sm sm:text-body text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {venue.description}
            </p>
          )}
          
          <div className="flex justify-between items-end text-sm sm:text-callout">
            <div className="text-gray-500 leading-tight">
              {venue.capacitySeated && venue.capacityStanding ? (
                <span>{venue.capacitySeated} sed. / {venue.capacityStanding} stoj.</span>
              ) : venue.capacitySeated ? (
                <span>{venue.capacitySeated} sedících</span>
              ) : venue.capacityStanding ? (
                <span>{venue.capacityStanding} stojících</span>
              ) : null}
            </div>
            
            {venue.priceRange && (
              <div className="font-medium text-black text-right leading-tight">
                {venue.priceRange}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}