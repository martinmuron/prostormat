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
  const andConditions: Prisma.VenueWhereInput[] = []

  if (!includeSubvenues) {
    where.parentId = null
  }

  const effectiveStatuses =
    statuses === null
      ? null
      : statuses && statuses.length > 0
        ? statuses
        : ['published']

  if (effectiveStatuses) {
    where.status = { in: effectiveStatuses }
  }

  if (q && q.trim().length > 0) {
    const term = q.trim()
    andConditions.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ],
    })
  }

  if (type && type !== 'all') {
    andConditions.push({
      OR: [
        { venueType: type },
        { venueTypes: { has: type } },
      ],
    })
  }

  if (district && district !== 'all') {
    const normalized = district.trim()
    andConditions.push({
      OR: [
        { district: { equals: normalized, mode: 'insensitive' } },
        { address: { endsWith: normalized, mode: 'insensitive' } },
        { address: { contains: `${normalized},`, mode: 'insensitive' } },
        { address: { contains: `${normalized} `, mode: 'insensitive' } },
      ],
    })
  }

  if (capacity && capacity !== 'all') {
    const condition = CAPACITY_CONDITIONS[capacity]
    if (condition) {
      andConditions.push(condition)
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  return where
}
