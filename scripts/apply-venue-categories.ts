import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'

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

const args = process.argv.slice(2)

function getArgValue(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`
  const match = args.find(arg => arg.startsWith(prefix))
  return match ? match.slice(prefix.length) : fallback
}

const inputPath = getArgValue('input', 'reports/venue-category-audit.json')!
const minScore = Number(getArgValue('min-score', '2'))
const limit = Number(getArgValue('limit', '0'))
const apply = args.includes('--apply')
const categoryFilter = getArgValue('category')
const includeUnchanged = args.includes('--include-current')
const outputPath = getArgValue('output', 'reports/venue-category-updates.csv')!

if (!fs.existsSync(inputPath)) {
  console.error(`Audit file not found: ${inputPath}`)
  process.exit(1)
}

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
  'other',
  'event_space',
  'chapel',
  'boat',
  'cinema',
  'education',
  'coworking',
  'sports'
])

const CATEGORY_NORMALISATION: Record<string, string> = {
  historic: 'historical',
  historical: 'historical',
  theatre: 'theater',
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

type AuditRow = {
  id: string
  name: string
  slug: string
  currentCategory: string | null
  suggestedCategories: Array<{ id: string; label: string; score: number; keywords: string[] }>
  topCategory: string | null
}

type UpdatePlan = {
  id: string
  name: string
  slug: string
  currentCategory: string | null
  newCategory: string
  suggestions: string[]
  scores: string
}

function buildUpdates(rows: AuditRow[]): UpdatePlan[] {
  return rows
    .map(row => {
      if (!row.topCategory) return null
      const top = row.suggestedCategories[0]
      if (!top) return null
      if (top.score < minScore) return null

      const normalisedTop = normaliseCategory(top.id)
      if (!normalisedTop) return null

      const suggestionList = row.suggestedCategories
        .filter(s => s.score >= minScore)
        .map(s => normaliseCategory(s.id))
        .filter((value): value is string => Boolean(value))

      if (!includeUnchanged) {
        if (row.currentCategory && normaliseCategory(row.currentCategory) === normalisedTop) {
          return null
        }
      }

      if (categoryFilter && normalisedTop !== categoryFilter) {
        return null
      }

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        currentCategory: row.currentCategory,
        newCategory: normalisedTop,
        suggestions: suggestionList.length > 0 ? suggestionList : [normalisedTop],
        scores: row.suggestedCategories
          .map(s => `${s.id}:${s.score}`)
          .join('|'),
      }
    })
    .filter((entry): entry is UpdatePlan => entry !== null)
}

async function applyUpdates(plans: UpdatePlan[]) {
  if (plans.length === 0) {
    console.log('No updates to apply.')
    return
  }

  const chunkSize = 20
  let processed = 0

  for (let i = 0; i < plans.length; i += chunkSize) {
    const chunk = plans.slice(i, i + chunkSize)

    await Promise.all(
      chunk.map(plan =>
        prisma.venue.update({
          where: { id: plan.id },
          data: {
            venueType: plan.newCategory,
            venueTypes: plan.suggestions,
          },
        })
      )
    )

    processed += chunk.length
    console.log(`Updated ${processed}/${plans.length}`)
  }
}

async function main() {
  const raw = fs.readFileSync(inputPath, 'utf8')
  const rows: AuditRow[] = JSON.parse(raw)

  const updates = buildUpdates(rows)

  const planned = limit > 0 ? updates.slice(0, limit) : updates

  console.log(`Planned updates: ${planned.length}${updates.length !== planned.length ? ` (showing first ${planned.length} due to limit)` : ''}`)

  const summary = planned.reduce((acc, plan) => {
    acc[plan.newCategory] = (acc[plan.newCategory] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedSummary = Object.entries(summary).sort((a, b) => b[1] - a[1])
  console.log('Category summary:')
  sortedSummary.forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`)
  })

  if (planned.length > 0) {
    const outputDir = dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const header = 'id,name,slug,currentCategory,newCategory,suggestions,scores'
    const rows = planned.map(plan => (
      [
        plan.id,
        plan.name.replace(/,/g, ';'),
        plan.slug,
        (plan.currentCategory ?? '').replace(/,/g, ';'),
        plan.newCategory,
        plan.suggestions.join('|'),
        plan.scores.replace(/,/g, ';'),
      ].join(',')
    ))

    fs.writeFileSync(outputPath, [header, ...rows].join('\n'), 'utf8')
    console.log(`\nUpdate preview saved to ${outputPath}`)
  }

  const preview = planned.slice(0, 10)
  if (preview.length > 0) {
    console.log('\nSample updates:')
    preview.forEach(plan => {
      console.log(
        `- ${plan.name} (${plan.slug}): ${plan.currentCategory ?? '—'} -> ${plan.newCategory} [${plan.scores}]`
      )
    })
  }

  if (!apply) {
    console.log('\nDry run complete. Re-run with --apply to persist changes.')
    return
  }

  await applyUpdates(planned)
  console.log('All updates applied.')
}

main()
  .catch(error => {
    console.error('Failed to apply venue categories:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
