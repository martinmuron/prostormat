export type VenueWithPriority = {
  priority: number | null
  prioritySource?: string | null
  homepageSlot?: {
    position: number | null
  } | null
}

type Seed = number

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithSeed<T>(items: T[], seed: Seed): T[] {
  const result = [...items]
  const random = mulberry32(seed)

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

export function sortVenuesByPriority<T extends VenueWithPriority>(
  venues: T[],
  seed: Seed
): T[] {
  const safeSeed = seed >>> 0
  const groupSeeds = [safeSeed + 1, safeSeed + 2, safeSeed + 3, safeSeed + 4]

  const homepagePriority: T[] = []
  const priorityGroups: Record<'p1' | 'p2' | 'p3' | 'none', T[]> = {
    p1: [],
    p2: [],
    p3: [],
    none: [],
  }

  for (const venue of venues) {
    const source =
      'prioritySource' in venue
        ? ((venue as { prioritySource?: string | null }).prioritySource ?? null)
        : null
    switch (venue.priority) {
      case 1:
        if (source === 'homepage') {
          homepagePriority.push(venue)
        } else {
          priorityGroups.p1.push(venue)
        }
        break
      case 2:
        priorityGroups.p2.push(venue)
        break
      case 3:
        priorityGroups.p3.push(venue)
        break
      default:
        priorityGroups.none.push(venue)
    }
  }

  const ordered: T[] = []
  if (homepagePriority.length) {
    const sortedHomepage = [...homepagePriority].sort((a, b) => {
      const aPosition =
        (a.homepageSlot && typeof a.homepageSlot.position === 'number'
          ? a.homepageSlot.position
          : Number.POSITIVE_INFINITY)
      const bPosition =
        (b.homepageSlot && typeof b.homepageSlot.position === 'number'
          ? b.homepageSlot.position
          : Number.POSITIVE_INFINITY)
      return aPosition - bPosition
    })
    ordered.push(...sortedHomepage)
  }

  ordered.push(...shuffleWithSeed(priorityGroups.p1, groupSeeds[0]))
  ordered.push(...shuffleWithSeed(priorityGroups.p2, groupSeeds[1]))
  ordered.push(...shuffleWithSeed(priorityGroups.p3, groupSeeds[2]))
  ordered.push(...shuffleWithSeed(priorityGroups.none, groupSeeds[3]))

  return ordered
}

export function generateOrderSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}
