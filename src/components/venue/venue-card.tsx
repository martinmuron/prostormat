import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { Users } from "lucide-react"
import { OptimizedImage } from "@/components/venue/OptimizedImage"

function getPrimaryAddress(rawAddress?: string | null): string | null {
  if (!rawAddress) {
    return null
  }

  const cleaned = rawAddress
    .replace(/\u00a0/g, ' ')
    .split(/[\n\t]|\s{2,}/)
    .map(part => part.trim())
    .filter(Boolean)

  const stripPostalCode = (value: string) => value.replace(/\b\d{3}\s?\d{2}\b/g, "").replace(/\s{2,}/g, " ").trim()

  const normalized = cleaned
    .map(stripPostalCode)
    .filter(Boolean)

  const firstMeaningful = normalized.find(part => /[\p{L}]/u.test(part))

  return firstMeaningful ?? normalized[0] ?? null
}

interface VenueCardProps {
  venue: {
    id: string
    name: string
    slug: string
    description?: string | null
    address: string
    district?: string | null
    capacitySeated?: number | null
    capacityStanding?: number | null
    venueType?: string | null
    venueTypes?: string[]
    images: string[]
  }
  priority?: boolean
}

export function VenueCard({ venue, priority = false }: VenueCardProps) {
  const mainImage = venue.images[0] || "/images/placeholder-venue.jpg"

  // Support both single venueType (legacy) and venueTypes array
  const categories = venue.venueTypes && venue.venueTypes.length > 0
    ? venue.venueTypes
    : venue.venueType
      ? [venue.venueType]
      : []

  const totalCapacity = Math.max(venue.capacitySeated || 0, venue.capacityStanding || 0)
  const displayAddress = getPrimaryAddress(venue.address)

  return (
    <Card className="overflow-hidden hover-lift transition-all duration-500 group border-2 border-black bg-white rounded-2xl h-full flex flex-col">
      <Link href={`/prostory/${venue.slug}`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          <OptimizedImage
            imagePath={mainImage}
            alt={venue.name}
            size="thumbnail"
            fill
            priority={priority}
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {categories.length > 0 && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-2 max-w-[80%]">
              {categories.slice(0, 2).map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="bg-black text-white border-black text-xs sm:text-sm font-semibold border-2"
                >
                  {VENUE_TYPES[cat as VenueType] || cat}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge
                  variant="secondary"
                  className="bg-black text-white border-black text-xs sm:text-sm font-semibold border-2"
                >
                  +{categories.length - 2}
                </Badge>
              )}
            </div>
          )}
          {venue.images.length > 1 && (
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <div className="flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {venue.images.length}
              </div>
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
              {venue.district && (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-1">
                  {venue.district}
                </p>
              )}
              {displayAddress && (
                <p className="text-sm sm:text-callout text-gray-600 font-medium">
                  {displayAddress}
                </p>
              )}
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
