import { PrismaClient } from '@prisma/client'

type VenueRecord = {
  id: string
  slug: string
  name: string
  address: string | null
  district: string | null
}

const prisma = new PrismaClient()
const APPLY_CHANGES = process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')

const MANUAL_OVERRIDES = new Map<string, string>([
  ['cm56f4z49dqlq', 'Praha 1'], // Alma Prague
  ['cmgbauk7e013lnts2crzdzutf', 'Praha 1'],
  ['cmgbaukat013nnts2ffa1r199', 'Praha 1'],
  ['cmgbauke6013pnts2sqtx8avg', 'Praha 1'],
  ['cmgbaukhe013rnts2ll9rqpfk', 'Praha 1'],
  ['cmgbau1fc00s7nts2v92utnlf', 'Praha 1'],
  ['cmgbatez500ernts2odldi86x', 'Praha 5'], // Area 51 Praha (Zličín)
  ['cmygs70xxnkg', 'Praha 8'],
  ['cmg8j37d40015ntz0557mf01a', 'Pardubice'],
  ['cmjjpweixiuig', 'Praha 1'],
  ['cmg8j36f5000jntz0d3np50m8', 'Zlín'],
  ['cmgbat4i0008lnts2w1gk4ff0', 'Praha - západ'],
  ['cmgbassu9001rnts24fm9vw0w', 'Praha 1'],
  ['cmg8j36ld000nntz052xi14il', 'Kraj Vysočina'],
  ['cmg8j38as001pntz0nq3ozwqp', 'Pardubice'],
  ['cmx83zo2jvwi', 'Praha 1'],
  ['cmg8j37j70019ntz0cptsr2jy', 'Zlín'],
  ['cmsp0cluaiya', 'Praha 10'],
  ['cmgbaspu40003nts2ymtl5zkr', 'Praha 1'],
  ['cmgbaspxi0005nts29bvt4yt9', 'Praha 1'],
  ['cmg8j392p0025ntz0jt7rdr9r', 'České Budějovice'],
  ['cmbokr9bhfh7u', 'Praha 1'],
  ['cmrqm18adf6ne', 'Praha 2'],
  ['cmg8j36um000tntz0o3xzm3ez', 'Bratislava'],
  ['cmgbasvc00035nts2rhhy73dx', 'Praha 1'],
  ['cmhoms0zl0g1h', 'Praha 1'],
  ['cm8qvop4amgie', 'Praha 3'],
  ['cmg8j387q001nntz0ufv3uum0', 'Středočeský kraj'],
])

const KEYWORD_MAP: Array<[string, string]> = [
  ['praha zapad', 'Praha - západ'],
  ['praha-zapad', 'Praha - západ'],
  ['prague west', 'Praha - západ'],
  ['praha vychod', 'Praha - východ'],
  ['praha-vychod', 'Praha - východ'],
  ['prague east', 'Praha - východ'],
  ['horomerice', 'Praha - západ'],
  ['cicovice', 'Praha - západ'],
  ['tachlovice', 'Praha - západ'],
  ['ricany u prahy', 'Praha - východ'],
  ['stredocesky kraj', 'Středočeský kraj'],
  ['stredni cechy', 'Střední Čechy'],
  ['kraj vysocina', 'Kraj Vysočina'],
  ['nizke tatry', 'Nízké Tatry'],
  ['zlicin', 'Praha 5'],
  ['smichov', 'Praha 5'],
  ['radlice', 'Praha 5'],
  ['hlubocepy', 'Praha 5'],
  ['andel', 'Praha 5'],
  ['velka chuchle', 'Praha 16'],
  ['lahovice', 'Praha 16'],
  ['brevnov', 'Praha 6'],
  ['bubenec', 'Praha 6'],
  ['dejvice', 'Praha 6'],
  ['ruzyne', 'Praha 6'],
  ['karlin', 'Praha 8'],
  ['liben', 'Praha 8'],
  ['holesovice', 'Praha 7'],
  ['letna', 'Praha 7'],
  ['troja', 'Praha 7'],
  ['vinohrady', 'Praha 2'],
  ['zizkov', 'Praha 3'],
  ['nove mesto', 'Praha 1'],
  ['stare mesto', 'Praha 1'],
  ['mala strana', 'Praha 1'],
  ['hradcany', 'Praha 1'],
  ['josefov', 'Praha 1'],
  ['vysehrad', 'Praha 2'],
  ['nusle', 'Praha 4'],
  ['michle', 'Praha 4'],
  ['zabehlice', 'Praha 10'],
  ['vrsovice', 'Praha 10'],
  ['strasnice', 'Praha 10'],
  ['malesice', 'Praha 10'],
  ['vysocany', 'Praha 9'],
  ['dolni pocernice', 'Praha 9'],
  ['horni pocernice', 'Praha 20'],
  ['stodulky', 'Praha 13'],
  ['liboc', 'Praha 6'],
  ['petrzalka', 'Bratislava'],
  ['bratislava', 'Bratislava'],
  ['pardubice', 'Pardubice'],
  ['ustupky', 'Pardubice'],
  ['sec', 'Pardubice'],
  ['ostrava', 'Ostrava'],
  ['plzen', 'Plzeň'],
  ['brno', 'Brno'],
  ['hradec kralove', 'Hradec Králové'],
  ['ceske budejovice', 'České Budějovice'],
  ['karlovy vary', 'Karlovy Vary'],
  ['liberec', 'Liberec'],
  ['zlin', 'Zlín'],
  ['zlinsky kraj', 'Zlín'],
  ['vapeni', 'Zlín'],
  ['bilovice', 'Zlín'],
  ['lipno nad vltavou', 'České Budějovice'],
  ['lipno', 'České Budějovice'],
  ['lisno', 'Středočeský kraj'],
  ['bystrice', 'Středočeský kraj'],
  ['benesov', 'Středočeský kraj'],
  ['pilsen', 'Plzeň'],
  ['prague west', 'Praha - západ'],
  ['prague east', 'Praha - východ'],
  ['prague 1 old town', 'Praha 1'],
  ['prague 8 karlin', 'Praha 8'],
  ['prague 5 andel', 'Praha 5'],
  ['prague 2 vinohrady', 'Praha 2'],
  ['prague 3 zizkov', 'Praha 3'],
  ['prague 7 holesovice', 'Praha 7'],
  ['prague 6 dejvice', 'Praha 6'],
  ['prague 5 smichov', 'Praha 5'],
  ['karlovo namesti', 'Praha 2'],
  ['namesti miru', 'Praha 2'],
  ['jiriho z podebrad', 'Praha 3'],
]

const POSTAL_CODE_MAP: Record<string, string> = {
  '11000': 'Praha 1',
  '11001': 'Praha 1',
  '11002': 'Praha 1',
  '11800': 'Praha 1',
  '11900': 'Praha 1',
  '12000': 'Praha 2',
  '12053': 'Praha 2',
  '12100': 'Praha 2',
  '12800': 'Praha 2',
  '13000': 'Praha 3',
  '13051': 'Praha 3',
  '14000': 'Praha 4',
  '14100': 'Praha 4',
  '14200': 'Praha 4',
  '14300': 'Praha 12',
  '14700': 'Praha 4',
  '14800': 'Praha 4',
  '14900': 'Praha 11',
  '15000': 'Praha 5',
  '15054': 'Praha 5',
  '15200': 'Praha 5',
  '15300': 'Praha 5',
  '15400': 'Praha 5',
  '15500': 'Praha 5',
  '15800': 'Praha 13',
  '15900': 'Praha 16',
  '16000': 'Praha 6',
  '16041': 'Praha 6',
  '16100': 'Praha 6',
  '16200': 'Praha 6',
  '16500': 'Praha 6',
  '16700': 'Praha 6',
  '17000': 'Praha 7',
  '17100': 'Praha 7',
  '18000': 'Praha 8',
  '18100': 'Praha 8',
  '18200': 'Praha 8',
  '18600': 'Praha 8',
  '19000': 'Praha 9',
  '19017': 'Praha 9',
  '19300': 'Praha 9',
  '19800': 'Praha 9',
  '19900': 'Praha 18',
  '10000': 'Praha 10',
  '10100': 'Praha 10',
  '10200': 'Praha 10',
  '10300': 'Praha 10',
  '10400': 'Praha 10',
  '10600': 'Praha 10',
  '10700': 'Praha 10',
  '10800': 'Praha 10',
  '10900': 'Praha 21',
}

function normalizeForMatch(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function extractDistrictFromString(raw?: string | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\u00a0/g, ' ').replace(/[\u2010-\u2015\u2212]/g, '-')
  const prahaMatch = cleaned.match(/(Praha|Prague)\s*[-–—]?\s*(\d{1,2})/i)
  if (prahaMatch) {
    const num = parseInt(prahaMatch[2], 10)
    if (Number.isInteger(num) && num >= 1 && num <= 22) {
      return `Praha ${num}`
    }
  }

  const normalized = normalizeForMatch(cleaned)
  for (const [keyword, value] of KEYWORD_MAP) {
    if (normalized.includes(keyword)) {
      return value
    }
  }

  return null
}

function extractDistrictFromPostal(raw?: string | null): string | null {
  if (!raw) return null
  const match = raw.match(/(\d{3})\s?(\d{2})/)
  if (!match) return null
  const postal = `${match[1]}${match[2]}`
  return POSTAL_CODE_MAP[postal] ?? null
}

function titleCase(value: string): string {
  if (!value) return value
  return value
    .split(' ')
    .map((word) => {
      if (!word) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function normalizeLooseLabel(raw?: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const fromString = extractDistrictFromString(trimmed)
  if (fromString) return fromString

  return titleCase(trimmed)
}

function determineDistrict(venue: VenueRecord): string | null {
  const manual = MANUAL_OVERRIDES.get(venue.id)
  if (manual) {
    return manual
  }

  const fromAddress = extractDistrictFromString(venue.address)
  if (fromAddress) return fromAddress

  const fromPostal = extractDistrictFromPostal(venue.address)
  if (fromPostal) return fromPostal

  const fromExisting = extractDistrictFromString(venue.district)
  if (fromExisting) return fromExisting

  const loose = normalizeLooseLabel(venue.district)
  if (loose) return loose

  return null
}

async function main() {
  try {
    const venues = await prisma.venue.findMany({
      select: { id: true, slug: true, name: true, address: true, district: true },
      orderBy: { name: 'asc' },
    })

    const updates: Array<{ id: string; slug: string; name: string; oldDistrict: string | null; newDistrict: string } > = []
    const unresolved: Array<VenueRecord & { reason: string }> = []

    for (const venue of venues) {
      const newDistrictRaw = determineDistrict(venue)
      if (!newDistrictRaw) {
        unresolved.push({ ...venue, reason: 'No heuristic match' })
        continue
      }

      const newDistrict = newDistrictRaw
      const currentValue = venue.district?.trim() || null
      const isSame = currentValue
        ? currentValue.localeCompare(newDistrict, undefined, { sensitivity: 'base' }) === 0
        : false

      if (!isSame) {
        updates.push({
          id: venue.id,
          slug: venue.slug,
          name: venue.name,
          oldDistrict: venue.district,
          newDistrict,
        })
      }
    }

    if (unresolved.length > 0) {
      console.error(`Unable to determine district for ${unresolved.length} venues.`)
      for (const missing of unresolved.slice(0, 20)) {
        console.error(`- ${missing.name} (${missing.slug}) :: address="${missing.address ?? 'N/A'}" currentDistrict="${missing.district ?? 'N/A'}"`)
      }
      console.error('Add manual overrides for the remaining venues before running with --apply.')
      if (APPLY_CHANGES) {
        console.error('Aborting because some venues are unresolved.')
        process.exit(1)
      }
    }

    if (updates.length === 0) {
      console.log('All venue districts already normalized. No changes required.')
      return
    }

    console.log(`Prepared updates for ${updates.length} venues${APPLY_CHANGES ? ' (will apply)' : ''}.`)

    if (!APPLY_CHANGES || VERBOSE) {
      const sample = updates.slice(0, 20)
      console.log('Sample changes:')
      for (const change of sample) {
        console.log(`  - ${change.name} (${change.slug}): "${change.oldDistrict ?? '—'}" -> "${change.newDistrict}"`)
      }
      if (!APPLY_CHANGES) {
        console.log('Run with --apply to persist these changes.')
      }
    }

    if (APPLY_CHANGES) {
      const CHUNK_SIZE = 50
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i + CHUNK_SIZE)
        await prisma.$transaction(
          chunk.map((change) =>
            prisma.venue.update({
              where: { id: change.id },
              data: { district: change.newDistrict },
            })
          )
        )
      }
      console.log('District updates applied successfully.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Failed to normalize venue districts:', error)
  process.exit(1)
})
