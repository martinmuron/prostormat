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
    venueType?: string | null
    images: string[]
  }
}

export function VenueCard({ venue }: VenueCardProps) {
  const mainImage = venue.images[0] || "/images/placeholder-venue.jpg"
  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType as VenueType] || venue.venueType : null

  return (
    <Card className="overflow-hidden hover-lift glass-card tilt-card transition-all duration-500 group border-0 bg-white/80 backdrop-blur-sm">
      <Link href={`/prostory/${venue.slug}`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={mainImage}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {venueTypeLabel && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <Badge variant="secondary" className="glass-card bg-white/95 text-gray-900 text-xs sm:text-sm font-semibold border-0 hover-glow">
                {venueTypeLabel}
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">→</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-white/95 to-white/90">
          <h3 className="text-lg sm:text-title-3 text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight font-bold">
            {venue.name}
          </h3>
          
          <p className="text-sm sm:text-callout text-gray-600 mb-3 line-clamp-2 font-medium">
            {venue.address}
          </p>
          
          {venue.description && (
            <p className="text-sm sm:text-body text-gray-700 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {venue.description}
            </p>
          )}
          
          <div className="text-sm sm:text-callout">
            <div className="text-gray-600 leading-tight font-medium">
              {venue.capacitySeated && venue.capacityStanding ? (
                <span className="px-2 py-1 bg-blue-50 rounded-lg">{venue.capacitySeated} sed. / {venue.capacityStanding} stoj.</span>
              ) : venue.capacitySeated ? (
                <span className="px-2 py-1 bg-blue-50 rounded-lg">{venue.capacitySeated} sedících</span>
              ) : venue.capacityStanding ? (
                <span className="px-2 py-1 bg-blue-50 rounded-lg">{venue.capacityStanding} stojících</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}