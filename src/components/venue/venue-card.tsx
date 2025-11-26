"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VENUE_TYPES } from "@/types"
import type { VenueType } from "@/types"
import { Users, Star } from "lucide-react"
import { OptimizedImage } from "@/components/venue/OptimizedImage"
import { HeartButton } from "@/components/venue/heart-button"

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  moonclub: "MOON Club",
}

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

  const formatPart = (value: string) => {
    const strippedComma = value.replace(/,+$/, "").trim()
    if (!strippedComma) {
      return null
    }

    const isAllUppercase = strippedComma === strippedComma.toUpperCase()
    if (isAllUppercase) {
      return strippedComma
        .toLocaleLowerCase("cs-CZ")
        .replace(/\b\p{L}/gu, char => char.toLocaleUpperCase("cs-CZ"))
    }

    return strippedComma
  }

  const formattedNormalized = normalized
    .map(formatPart)
    .filter((part): part is string => Boolean(part))

  const firstMeaningful = formattedNormalized.find(part => /[\p{L}]/u.test(part))

  return firstMeaningful ?? formattedNormalized[0] ?? null
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
    priority?: number | null
  }
  priority?: boolean
  showPriorityBadge?: boolean
}

export function VenueCard({ venue, priority = false, showPriorityBadge = false }: VenueCardProps) {
  const mainImage = venue.images[0] || "/images/placeholder-venue.jpg"

  const categories = venue.venueTypes && venue.venueTypes.length > 0
    ? venue.venueTypes
    : venue.venueType
      ? [venue.venueType]
      : []

  const totalCapacity = Math.max(venue.capacitySeated || 0, venue.capacityStanding || 0)
  const displayAddress = getPrimaryAddress(venue.address)

  return (
    <Card className="overflow-hidden hover-lift transition-all duration-500 group border-2 border-black bg-white rounded-2xl h-full flex flex-col gap-0 py-0">
      <div className="aspect-[4/3] relative overflow-hidden">
        <Link href={`/prostory/${venue.slug}`} className="block absolute inset-0">
          <OptimizedImage
            imagePath={mainImage}
            alt={venue.name}
            size="thumbnail"
            fill
            priority={priority}
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
        {categories.length > 0 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-2 max-w-[80%] pointer-events-none z-10">
            {categories.slice(0, 2).map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="bg-black text-white border-black text-sm font-semibold border-2"
              >
                {VENUE_TYPES[cat as VenueType] || cat}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-black text-white border-black text-sm font-semibold border-2"
              >
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}
        {venue.images.length > 1 && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 pointer-events-none z-10">
            <div className="flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-full text-sm font-medium shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {venue.images.length}
            </div>
          </div>
        )}
        {showPriorityBadge && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none">
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              Doporučeno
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-6 bg-white flex flex-col justify-between h-full">
        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/prostory/${venue.slug}`} className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl text-black group-hover:text-gray-500 transition-all duration-300 leading-tight font-bold tracking-tight">
                  {DISPLAY_NAME_OVERRIDES[venue.slug] ?? venue.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <HeartButton venueId={venue.id} size="sm" />
                {totalCapacity > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-black text-black font-semibold text-sm whitespace-nowrap">
                    <Users className="h-3 w-3" />
                    {totalCapacity}
                  </span>
                )}
              </div>
            </div>
            <Link href={`/prostory/${venue.slug}`}>
              {venue.district && (
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 mt-1">
                  {venue.district}
                </p>
              )}
              {displayAddress && (
                <p className="text-sm text-gray-600 font-medium">
                  {displayAddress}
                </p>
              )}
            </Link>
          </div>

          <Link href={`/prostory/${venue.slug}`}>
            <div className="min-h-[2.5rem] mb-3">
              {venue.description && (
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  {venue.description}
                </p>
              )}
            </div>
          </Link>
        </div>

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
