import { config } from 'dotenv'
import { resolve } from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const remoteDatabaseUrl =
  process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.')
  }

  process.env.DATABASE_URL = remoteDatabaseUrl
}

const prisma = new PrismaClient()

type CategoryRule = {
  id: string
  label: string
  keywords: string[]
  weight?: number
}

type VenueRecord = {
  id: string
  name: string
  slug: string
  venueType: string | null
  description: string | null
  websiteUrl: string | null
}

type AuditResult = {
  id: string
  name: string
  slug: string
  currentCategory: string | null
  suggestedCategories: Array<{ id: string; label: string; score: number; keywords: string[] }>
  topCategory: string | null
  websiteFetch: {
    attempted: boolean
    succeeded: boolean
    finalUrl?: string
    error?: string
  }
  keyPhrases: string[]
}

const CATEGORY_RULES: CategoryRule[] = [
  { id: 'club', label: 'Club', keywords: ['club', 'nightclub', 'night club', 'noční klub', 'dance floor', 'dj', 'party'] },
  { id: 'bar', label: 'Bar', keywords: ['bar', 'cocktail', 'cocktail bar', 'mezcaleria', 'wine bar', 'gin bar', 'rum bar', 'lounge', 'mixology', 'tapas bar', 'pub'] },
  { id: 'restaurant', label: 'Restaurant', keywords: ['restaurant', 'restaurace', 'bistro', 'kitchen', 'steakhouse', 'dining', 'chef'] },
  { id: 'conference', label: 'Conference', keywords: ['conference', 'konference', 'kongres', 'meeting', 'meeting room', 'boardroom', 'seminář', 'workshop', 'training room', 'jednací místnost', 'salonek', 'meetingové'] },
  { id: 'event_space', label: 'Event Space', keywords: ['event space', 'eventové', 'multifunkční', 'společenský sál', 'pronájem prostoru', 'private event', 'corporate event', 'venue for events', 'firemní akce', 'oslavy', 'teambuilding'] },
  { id: 'hotel', label: 'Hotel', keywords: ['hotel', 'boutique hotel', 'accommodation', 'rooms', 'ubytování', 'wellness hotel', 'resort'] },
  { id: 'rooftop', label: 'Rooftop', keywords: ['rooftop', 'roof', 'sky bar', 'skybar', 'střecha', 'roof terrace', 'terrace', 'terasa'] },
  { id: 'gallery', label: 'Gallery', keywords: ['gallery', 'galerie', 'exhibition', 'výstava', 'art space', 'art gallery'] },
  { id: 'garden', label: 'Garden', keywords: ['garden', 'zahrada', 'park', 'outdoor', 'outdoor space', 'venkovní', 'courtyard'] },
  { id: 'historic', label: 'Historic / Castle', keywords: ['historic', 'castle', 'chateau', 'zámek', 'palace', 'palác', 'historický'] },
  { id: 'studio', label: 'Studio', keywords: ['studio', 'fotostudio', 'film studio', 'atelier', 'soundstage', 'recording studio', 'photo studio'] },
  { id: 'coworking', label: 'Coworking', keywords: ['cowork', 'coworking', 'shared office', 'workhub'] },
  { id: 'sports', label: 'Sports / Fitness', keywords: ['sport', 'sportovní', 'fitness', 'gym', 'arena', 'pitch', 'stadium', 'bowling'] },
  { id: 'theatre', label: 'Theatre', keywords: ['theatre', 'divadlo', 'stage', 'performance hall', 'auditorium'] },
  { id: 'cinema', label: 'Cinema', keywords: ['cinema', 'kino', 'screening room', 'film projection'] },
  { id: 'loft', label: 'Loft / Industrial', keywords: ['loft', 'industrial', 'warehouse', 'factory', 'brownfield'] },
  { id: 'chapel', label: 'Chapel', keywords: ['chapel', 'kaple', 'church', 'kostel'] },
  { id: 'boat', label: 'Boat', keywords: ['boat', 'loď', 'lodní', 'ship'] },
  { id: 'museum', label: 'Museum', keywords: ['museum', 'muzeum'] },
  { id: 'education', label: 'Education', keywords: ['school', 'university', 'academy', 'learning centre', 'kurz', 'workshop center'] },
]

const KNOWN_CATEGORIES = new Set([
  'restaurant',
  'bar',
  'cafe',
  'rooftop',
  'gallery',
  'conference',
  'historical',
  'villa',
  'palace',
  'hotel',
  'garden',
  'studio',
  'loft',
  'club',
  'theater',
  'museum',
  'winery',
  'event_space',
  'chapel',
  'boat',
  'cinema',
  'education',
  'coworking',
  'sports',
  'other',
])

const CATEGORY_NORMALISATION: Record<string, string> = {
  historic: 'historical',
  historical: 'historical',
  theatre: 'theater',
  konference: 'conference',
}

function normaliseCategory(category: string | null | undefined): string | null {
  if (!category) return null
  const lower = category.toLowerCase()
  const normalised = CATEGORY_NORMALISATION[lower] ?? lower
  if (KNOWN_CATEGORIES.has(normalised)) {
    return normalised
  }
  return null
}

const args = process.argv.slice(2)
const limitArg = args.find(arg => arg.startsWith('--limit='))
const skipFetch = args.includes('--skip-fetch')
const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined

const MAX_FETCHES = skipFetch ? 0 : 8
const FETCH_TIMEOUT_MS = 10000

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countMatches(text: string, keyword: string): number {
  const pattern = new RegExp(escapeRegex(keyword), 'gi')
  return (text.match(pattern) || []).length
}

async function fetchWebsiteText(url: string | null): Promise<{ attempted: boolean; succeeded: boolean; finalUrl?: string; text: string; error?: string }> {
  if (!url || skipFetch) {
    return { attempted: Boolean(url) && !skipFetch, succeeded: false, text: '' }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'ProstormatCategoryAudit/1.0 (+https://www.prostormat.cz)',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return {
        attempted: true,
        succeeded: false,
        text: '',
        error: `HTTP ${response.status}`,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    $('script, style, noscript').remove()
    const text = $('body').text().replace(/\s+/g, ' ').trim()
    return {
      attempted: true,
      succeeded: true,
      finalUrl: response.url,
      text: text.slice(0, 40000),
    }
  } catch (error) {
    clearTimeout(timeout)
    return {
      attempted: true,
      succeeded: false,
      text: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function classifyVenue(venue: VenueRecord, websiteText: string): { suggestions: AuditResult['suggestedCategories']; keyPhrases: string[] } {
  const corpus = [venue.name, venue.description, websiteText]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const keyPhrases = new Set<string>()

  const suggestions = CATEGORY_RULES.map(rule => {
    let score = 0
    const matchedKeywords: string[] = []

    rule.keywords.forEach(keyword => {
      const matches = countMatches(corpus, keyword.toLowerCase())
      if (matches > 0) {
        score += matches * (rule.weight ?? 1)
        matchedKeywords.push(keyword)
        keyPhrases.add(keyword)
      }
    })

    return {
      id: rule.id,
      label: rule.label,
      score,
      keywords: matchedKeywords,
    }
  })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  if (suggestions.length === 0) {
    const fallback = normaliseCategory(venue.venueType)
    if (fallback) {
      suggestions.push({
        id: fallback,
        label: fallback,
        score: 0,
        keywords: [],
      })
    }
  }

  return {
    suggestions,
    keyPhrases: Array.from(keyPhrases),
  }
}

async function main() {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      venueType: true,
      description: true,
      websiteUrl: true,
    },
    orderBy: { name: 'asc' },
    take: limit,
  })

  console.log(`Loaded ${venues.length} venues. Starting audit${skipFetch ? ' (website fetch disabled)' : ''}...`)

  const results: AuditResult[] = []
  const queue: VenueRecord[] = [...venues]

  async function processVenue(venue: VenueRecord): Promise<void> {
    const website = await fetchWebsiteText(venue.websiteUrl)
    const { suggestions, keyPhrases } = classifyVenue(venue, website.text)

    const topCategory = suggestions.length > 0 ? suggestions[0].id : null

    results.push({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      currentCategory: venue.venueType,
      suggestedCategories: suggestions.slice(0, 5),
      topCategory,
      websiteFetch: {
        attempted: website.attempted,
        succeeded: website.succeeded,
        finalUrl: website.finalUrl,
        error: website.error,
      },
      keyPhrases,
    })

    if (results.length % 25 === 0) {
      console.log(`Processed ${results.length}/${venues.length}`)
    }
  }

  const workers: Promise<void>[] = []
  const workerCount = Math.max(1, MAX_FETCHES || 1)
  for (let i = 0; i < workerCount; i += 1) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const venue = queue.shift()
          if (!venue) {
            break
          }
          await processVenue(venue)
        }
      })()
    )
  }

  await Promise.all(workers)

  results.sort((a, b) => a.name.localeCompare(b.name))

  fs.mkdirSync('reports', { recursive: true })

  const jsonPath = 'reports/venue-category-audit.json'
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8')

  const csvLines = [
    ['id', 'name', 'slug', 'currentCategory', 'topCategory', 'suggestedCategories', 'keywordHits', 'websiteFetchStatus', 'websiteError'].join(','),
    ...results.map(entry => {
      const suggested = entry.suggestedCategories.map(s => `${s.id}:${s.score}`).join('|')
      const status = entry.websiteFetch.succeeded ? 'fetched' : entry.websiteFetch.attempted ? 'failed' : skipFetch ? 'skipped' : 'skipped'
      const error = entry.websiteFetch.error ? entry.websiteFetch.error.replace(/,/g, ';') : ''
      return [
        entry.id,
        entry.name.replace(/,/g, ';'),
        entry.slug,
        entry.currentCategory ?? '',
        entry.topCategory ?? '',
        suggested,
        entry.keyPhrases.join('|'),
        status,
        error,
      ].join(',')
    }),
  ]

  const csvPath = 'reports/venue-category-audit.csv'
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8')

  const summary = results.reduce(
    (acc, entry) => {
      const bucket = entry.topCategory ?? 'unclassified'
      acc[bucket] = (acc[bucket] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log('Audit complete.')
  console.log('Suggested category distribution:')
  for (const [category, count] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${category}: ${count}`)
  }

  console.log(`Results saved to ${jsonPath} and ${csvPath}`)
}

main()
  .catch(error => {
    console.error('Audit failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
