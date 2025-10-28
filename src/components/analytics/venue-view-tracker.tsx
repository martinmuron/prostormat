'use client'

import { useEffect } from "react"
import { createTrackingContext } from "@/lib/tracking-utils"
import { trackGA4ViewVenue } from "@/lib/ga4-tracking"

interface VenueViewTrackerProps {
  venueId: string
  venueName: string
  category?: string | null
  price?: number | null
}

export function VenueViewTracker({ venueId, venueName, category, price }: VenueViewTrackerProps) {
  useEffect(() => {
    const tracking = createTrackingContext()
    trackGA4ViewVenue({
      venue_id: venueId,
      venue_name: venueName,
      venue_type: category ?? undefined,
      paid: typeof price === "number" ? price > 0 : undefined,
      tracking,
    })
  }, [venueId, venueName, category, price])

  return null
}
