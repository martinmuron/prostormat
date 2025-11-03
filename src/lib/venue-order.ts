import { Prisma, type PrismaClient } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * Get current time-based seed for venue randomization.
 * Rotates every 5 minutes (300,000 milliseconds).
 */
export function getCurrentSeed(): number {
  return Math.floor(Date.now() / 300000)
}

/**
 * Build Prisma orderBy clause for contexts that rely on deterministic ordering.
 * (Admin dashboards and other areas that shouldn't be randomized.)
 */
export function buildVenueOrdering(): Prisma.VenueOrderByWithRelationInput[] {
  return [
    {
      homepageSlot: {
        position: "asc",
      },
    },
    {
      priority: "asc",
    },
    {
      name: "asc",
    },
    {
      id: "asc",
    },
  ]
}

type VenueQueryFilters = {
  q?: string | null
  type?: string | null
  district?: string | null
  capacity?: string | null
  statuses: string[]
  includeSubvenues?: boolean
}

type RandomizedVenueRow = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  district: string | null
  capacitySeated: number | null
  capacityStanding: number | null
  venueType: string | null
  venueTypes: string[]
  images: string[]
  status: string
  priority: number | null
  prioritySource: string | null
  homepageSlotPosition: number | null
}

type RandomizedVenueResult = {
  venues: Array<
    Omit<RandomizedVenueRow, "homepageSlotPosition"> & {
      homepageSlot: { position: number } | null
    }
  >
  totalCount: number
  hasMore: boolean
}

function buildStatusCondition(statuses: string[]): Prisma.Sql {
  const statusArray = Prisma.sql`ARRAY[${Prisma.join(
    statuses.map((status) => Prisma.sql`${status}`),
  )}]::text[]`
  return Prisma.sql`v."status" = ANY(${statusArray})`
}

function buildCapacityCondition(capacity: string): Prisma.Sql | null {
  switch (capacity) {
    case "méně než 30":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" < 30)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" < 30)
      )`
    case "30":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" BETWEEN 30 AND 59)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" BETWEEN 30 AND 59)
      )`
    case "60":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" BETWEEN 60 AND 119)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" BETWEEN 60 AND 119)
      )`
    case "120":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" BETWEEN 120 AND 239)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" BETWEEN 120 AND 239)
      )`
    case "240":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" BETWEEN 240 AND 479)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" BETWEEN 240 AND 479)
      )`
    case "480":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" BETWEEN 480 AND 959)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" BETWEEN 480 AND 959)
      )`
    case "více jak 480":
      return Prisma.sql`(
        (v."capacitySeated" IS NOT NULL AND v."capacitySeated" >= 480)
        OR (v."capacityStanding" IS NOT NULL AND v."capacityStanding" >= 480)
      )`
    default:
      return null
  }
}

function buildWhereClause({
  q,
  type,
  district,
  capacity,
  statuses,
  includeSubvenues = false,
}: VenueQueryFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = []

  if (!includeSubvenues) {
    conditions.push(Prisma.sql`v."parentId" IS NULL`)
  }

  if (statuses.length > 0) {
    conditions.push(buildStatusCondition(statuses))
  }

  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`
    conditions.push(
      Prisma.sql`(
        v."name" ILIKE ${term}
        OR v."description" ILIKE ${term}
        OR v."address" ILIKE ${term}
      )`,
    )
  }

  if (type && type !== "all") {
    conditions.push(
      Prisma.sql`(
        v."venueType" = ${type}
        OR v."venueTypes" @> ARRAY[${type}]::text[]
      )`,
    )
  }

  if (district && district !== "all") {
    const normalized = district.trim()
    const suffixMatch = `%${normalized},%`
    const spacedMatch = `%${normalized} %`
    const endsWithPattern = `%${normalized}`
    conditions.push(
      Prisma.sql`(
        v."district" ILIKE ${normalized}
        OR v."address" ILIKE ${endsWithPattern}
        OR v."address" ILIKE ${suffixMatch}
        OR v."address" ILIKE ${spacedMatch}
      )`,
    )
  }

  if (capacity && capacity !== "all") {
    const condition = buildCapacityCondition(capacity)
    if (condition) {
      conditions.push(condition)
    }
  }

  if (conditions.length === 0) {
    return Prisma.sql`TRUE`
  }

  let combined = conditions[0]
  for (let i = 1; i < conditions.length; i += 1) {
    combined = Prisma.sql`${combined} AND ${conditions[i]}`
  }

  return combined
}

export async function fetchRandomizedVenuePage({
  filters,
  seed,
  take,
  skip,
  prismaClient = db,
}: {
  filters: VenueQueryFilters
  seed: number
  take: number
  skip: number
  prismaClient?: PrismaClient
}): Promise<RandomizedVenueResult> {
  const whereSql = buildWhereClause(filters)
  const seedText = seed.toString()

  const countQuery = Prisma.sql`
    SELECT COUNT(*)
    FROM "prostormat_venues" v
    LEFT JOIN "prostormat_homepage_venues" hv ON hv."venueId" = v."id"
    WHERE ${whereSql}
  `

  const dataQuery = Prisma.sql`
    SELECT
      v."id",
      v."name",
      v."slug",
      v."description",
      v."address",
      v."district",
      v."capacitySeated",
      v."capacityStanding",
      v."venueType",
      v."venueTypes",
      v."images",
      v."status",
      v."priority",
      v."prioritySource",
      hv."position" AS "homepageSlotPosition"
    FROM "prostormat_venues" v
    LEFT JOIN "prostormat_homepage_venues" hv ON hv."venueId" = v."id"
    WHERE ${whereSql}
    ORDER BY
      CASE WHEN hv."position" IS NOT NULL THEN 0 ELSE 1 END,
      hv."position" ASC NULLS LAST,
      CASE WHEN v."priority" IS NOT NULL THEN 0 ELSE 1 END,
      COALESCE(v."priority", 99) ASC,
      md5(v."id" || ${seedText}),
      v."id"
    LIMIT ${take}
    OFFSET ${skip}
  `

  const [countResult, rows] = await Promise.all([
    prismaClient.$queryRaw<{ count: bigint }[]>(countQuery),
    prismaClient.$queryRaw<RandomizedVenueRow[]>(dataQuery),
  ])

  const totalCount = Number(countResult[0]?.count ?? 0)

  return {
    venues: rows.map((row) => ({
      ...row,
      homepageSlot: row.homepageSlotPosition != null ? { position: row.homepageSlotPosition } : null,
    })),
    totalCount,
    hasMore: skip + rows.length < totalCount,
  }
}
