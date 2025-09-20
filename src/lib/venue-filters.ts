import { Prisma } from '@prisma/client'

type FilterParams = {
  q?: string | null
  type?: string | null
  district?: string | null
  capacity?: string | null
  statuses?: string[]
}

const CAPACITY_CONDITIONS: Record<string, Prisma.VenueWhereInput> = {
  'Do 25 lidí': {
    OR: [
      { capacitySeated: { lte: 25 } },
      { capacityStanding: { lte: 25 } },
    ],
  },
  '25 - 50 lidí': {
    OR: [
      { capacitySeated: { gte: 25, lte: 50 } },
      { capacityStanding: { gte: 25, lte: 50 } },
    ],
  },
  '50 - 100 lidí': {
    OR: [
      { capacitySeated: { gte: 50, lte: 100 } },
      { capacityStanding: { gte: 50, lte: 100 } },
    ],
  },
  '100 - 200 lidí': {
    OR: [
      { capacitySeated: { gte: 100, lte: 200 } },
      { capacityStanding: { gte: 100, lte: 200 } },
    ],
  },
  'Nad 200 lidí': {
    OR: [
      { capacitySeated: { gte: 200 } },
      { capacityStanding: { gte: 200 } },
    ],
  },
}

export function buildVenueWhereClause({
  q,
  type,
  district,
  capacity,
  statuses = ['published', 'active'],
}: FilterParams): Prisma.VenueWhereInput {
  const where: Prisma.VenueWhereInput = {
    status: { in: statuses },
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
