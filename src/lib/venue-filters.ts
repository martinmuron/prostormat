import { Prisma } from '@prisma/client'

type FilterParams = {
  q?: string | null
  type?: string | null
  district?: string | null
  capacity?: string | null
  statuses?: string[] | null
  includeSubvenues?: boolean
}

const CAPACITY_CONDITIONS: Record<string, Prisma.VenueWhereInput> = {
  'méně než 30': {
    OR: [
      { capacitySeated: { lt: 30 } },
      { capacityStanding: { lt: 30 } },
    ],
  },
  '30': {
    OR: [
      { capacitySeated: { gte: 30, lt: 60 } },
      { capacityStanding: { gte: 30, lt: 60 } },
    ],
  },
  '60': {
    OR: [
      { capacitySeated: { gte: 60, lt: 120 } },
      { capacityStanding: { gte: 60, lt: 120 } },
    ],
  },
  '120': {
    OR: [
      { capacitySeated: { gte: 120, lt: 240 } },
      { capacityStanding: { gte: 120, lt: 240 } },
    ],
  },
  '240': {
    OR: [
      { capacitySeated: { gte: 240, lt: 480 } },
      { capacityStanding: { gte: 240, lt: 480 } },
    ],
  },
  '480': {
    OR: [
      { capacitySeated: { gte: 480, lt: 960 } },
      { capacityStanding: { gte: 480, lt: 960 } },
    ],
  },
  'více jak 480': {
    OR: [
      { capacitySeated: { gte: 480 } },
      { capacityStanding: { gte: 480 } },
    ],
  },
  'Ještě nevím': {
    // No capacity filter - show all venues
  },
}

export function buildVenueWhereClause({
  q,
  type,
  district,
  capacity,
  statuses,
  includeSubvenues = false,
}: FilterParams): Prisma.VenueWhereInput {
  const where: Prisma.VenueWhereInput = {}

  if (!includeSubvenues) {
    where.parentId = null
  }

  if (statuses && statuses.length > 0) {
    where.status = { in: statuses }
  }

  if (q && q.trim().length > 0) {
    const term = q.trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { address: { contains: term, mode: 'insensitive' } },
    ]
  }

  if (type && type !== 'all') {
    where.venueType = type
  }

  if (district && district !== 'all') {
    where.address = {
      contains: district,
      mode: 'insensitive',
    }
  }

  if (capacity && capacity !== 'all') {
    const condition = CAPACITY_CONDITIONS[capacity]
    if (condition) {
      Object.assign(where, condition)
    }
  }

  return where
}
