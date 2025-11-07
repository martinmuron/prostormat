import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"

export type VenueMatch = {
  id: string
  name: string
  slug: string
  contactEmail: string | null
  capacityStanding: number | null
  capacitySeated: number | null
  district: string | null
  manager: {
    name: string | null
    email: string | null
  } | null
}

export const QUICK_REQUEST_GUEST_LABELS: Record<string, string> = {
  "1-25": "1-25 hostů",
  "26-50": "26-50 hostů",
  "51-100": "51-100 hostů",
  "101-200": "101-200 hostů",
  "200+": "200+ hostů",
}

const GUEST_RANGE_BOUNDARIES: Array<{
  max: number
  range: keyof typeof QUICK_REQUEST_GUEST_LABELS
}> = [
  { max: 25, range: "1-25" },
  { max: 50, range: "26-50" },
  { max: 100, range: "51-100" },
  { max: 200, range: "101-200" },
]

export function parseGuestCount(range: string): { min: number; max: number | null } {
  const ranges: { [key: string]: { min: number; max: number | null } } = {
    "1-25": { min: 1, max: 25 },
    "26-50": { min: 26, max: 50 },
    "51-100": { min: 51, max: 100 },
    "101-200": { min: 101, max: 200 },
    "200+": { min: 200, max: null },
  }
  return ranges[range] || { min: 0, max: null }
}

export function deriveGuestRangeFromNumber(
  guestCount?: number | null
): { rangeKey: string | null; label: string | null } {
  if (typeof guestCount !== "number" || Number.isNaN(guestCount) || guestCount <= 0) {
    return { rangeKey: null, label: null }
  }

  const normalized = Math.ceil(guestCount)

  for (const boundary of GUEST_RANGE_BOUNDARIES) {
    if (normalized <= boundary.max) {
      return {
        rangeKey: boundary.range,
        label: QUICK_REQUEST_GUEST_LABELS[boundary.range],
      }
    }
  }

  return {
    rangeKey: "200+",
    label: QUICK_REQUEST_GUEST_LABELS["200+"],
  }
}

export async function findMatchingVenues(criteria: {
  guestCount?: string | number | null
  locationPreference?: string | null
}): Promise<VenueMatch[]> {
  const { guestCount, locationPreference } = criteria

  let minGuests = 0
  if (typeof guestCount === "string" && guestCount.trim().length > 0) {
    // Try parsing as direct number first (e.g., "40")
    const directNumber = parseInt(guestCount)
    if (!isNaN(directNumber) && directNumber > 0) {
      minGuests = directNumber
    } else {
      // Fallback for old range format (backward compatibility)
      minGuests = parseGuestCount(guestCount).min
    }
  } else if (typeof guestCount === "number" && Number.isFinite(guestCount)) {
    minGuests = Math.max(0, Math.floor(guestCount))
  }

  const trimmedLocation =
    typeof locationPreference === "string" && locationPreference.trim().length > 0
      ? locationPreference.trim()
      : null

  const where: Prisma.VenueWhereInput = {
    status: "published",
    parentId: null, // Only match parent venues - child venues (sub-spaces) are managed by their parent
  }

  const andConditions: Prisma.VenueWhereInput[] = []

  if (trimmedLocation) {
    // Treat "Celá Praha" and "Praha" the same - match all Praha districts
    if (trimmedLocation === "Celá Praha" || trimmedLocation === "Praha") {
      andConditions.push({
        district: {
          startsWith: "Praha",
          mode: "insensitive",
        },
      })
    } else {
      andConditions.push({
        OR: [
          { district: { equals: trimmedLocation, mode: "insensitive" } },
          { address: { contains: trimmedLocation, mode: "insensitive" } },
        ],
      })
    }
  }

  if (minGuests > 0) {
    andConditions.push({
      OR: [
        { capacityStanding: { gte: minGuests } },
        { capacitySeated: { gte: minGuests } },
      ],
    })
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  const venues = await db.venue.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      contactEmail: true,
      capacityStanding: true,
      capacitySeated: true,
      district: true,
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  console.log("[Quick Request Matcher] Matched venues:", {
    count: venues.length,
    minGuests,
    location: trimmedLocation,
    excludedSubVenues: true,
  })

  if (minGuests <= 0) {
    return venues
  }

  return venues.filter((venue) => {
    const standing = venue.capacityStanding ?? 0
    const seated = venue.capacitySeated ?? 0
    const maxCapacity = Math.max(standing, seated)
    return maxCapacity >= minGuests
  })
}
