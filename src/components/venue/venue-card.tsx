import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { Users } from "lucide-react"

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
  const totalCapacity = Math.max(venue.capacitySeated || 0, venue.capacityStanding || 0)

  return (
    <Card className="overflow-hidden hover-lift transition-all duration-500 group border-2 border-black bg-white rounded-2xl h-full flex flex-col">
      <Link href={`/prostory/${venue.slug}`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={mainImage}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {venueTypeLabel && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <Badge variant="secondary" className="bg-black text-white border-black text-xs sm:text-sm font-semibold border-2">
                {venueTypeLabel}
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
              <span className="text-sm font-bold text-black">→</span>
            </div>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 sm:p-6 bg-white flex flex-col justify-between h-full">
        <Link href={`/prostory/${venue.slug}`}>
          <div className="flex-1">
            <div className="mb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg sm:text-title-3 text-black group-hover:text-gray-500 transition-all duration-300 leading-tight font-bold tracking-tight flex-1">
                  {venue.name}
                </h3>
                {totalCapacity > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-black text-black font-semibold text-xs whitespace-nowrap">
                    <Users className="h-3 w-3" />
                    {totalCapacity}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-callout text-gray-600 font-medium">
                {venue.address}
              </p>
            </div>
            
            <div className="min-h-[3rem] mb-4">
              {venue.description && (
                <p className="text-sm sm:text-body text-gray-700 line-clamp-2 leading-relaxed">
                  {venue.description}
                </p>
              )}
            </div>
          </div>
        </Link>
        
        <Link href={`/prostory/${venue.slug}`} className="mt-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium rounded-xl"
          >
            <span>Zobrazit detaily</span>
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}