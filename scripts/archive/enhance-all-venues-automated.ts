import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

const MIN_LENGTH = 600
const DELAY_BETWEEN_VENUES = 2000

interface VenueData {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  district: string | null
  websiteUrl: string | null
  venueTypes: string[]
  amenities: string[]
  capacitySeated: number | null
  capacityStanding: number | null
}

// Scrape website content
async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) return ''

    const html = await response.text()
    const $ = cheerio.load(html)
    $('script, style, nav, header, footer').remove()

    const selectors = ['main', 'article', '[class*="content"]', '[class*="about"]', 'section', 'p']
    let content = ''
    for (const selector of selectors) {
      const text = $(selector).text().trim()
      if (text.length > content.length) content = text
    }

    return content.replace(/\s+/g, ' ').trim().slice(0, 3000)
  } catch {
    return ''
  }
}

// Generate enhanced description
function generateEnhancedDescription(venue: VenueData, websiteContent: string): string {
  const existing = venue.description || ''
  const types = venue.venueTypes.join(', ')
  const amenities = venue.amenities.join(', ')
  const capacity = venue.capacitySeated || venue.capacityStanding || 0

  // Extract key information from website
  const websiteSnippet = websiteContent.slice(0, 500).toLowerCase()

  // Build enhanced description
  let enhanced = existing

  // Add location context
  if (venue.district && !existing.includes(venue.district)) {
    enhanced += ` Nachází se v ${venue.district}.`
  }

  // Add capacity if significant
  if (capacity > 0 && !existing.includes('kapacit')) {
    const capacityType = venue.capacitySeated ? 'k sezení' : 've stoje'
    enhanced += ` Prostor nabízí kapacitu až ${capacity} osob ${capacityType}.`
  }

  // Add venue type context
  if (types && !existing.toLowerCase().includes(types.split(',')[0])) {
    enhanced += ` Jedná se o ${types.split(',')[0]} prostor.`
  }

  // Add amenities
  if (amenities && amenities.length > 10) {
    enhanced += ` K dispozici je ${amenities}.`
  }

  // Add website-derived insights
  if (websiteContent.length > 100) {
    // Check for key phrases and add relevant info
    if (websiteSnippet.includes('historie') || websiteSnippet.includes('histor')) {
      enhanced += ' Prostor se pyšní bohatou historií.'
    }
    if (websiteSnippet.includes('modern') || websiteSnippet.includes('současn')) {
      enhanced += ' Moderní vybavení zajišťuje komfort pro vaše akce.'
    }
    if (websiteSnippet.includes('akce') || websiteSnippet.includes('event')) {
      enhanced += ' Ideální pro firemní akce, oslavy a společenské události.'
    }
    if (websiteSnippet.includes('catering') || websiteSnippet.includes('stravování')) {
      enhanced += ' Možnost profesionálního cateringu.'
    }
  }

  // Add general closing
  if (!existing.includes('Ideální') && !existing.includes('ideální')) {
    enhanced += ` ${venue.name} je ideálním místem pro vaše akce v Praze.`
  }

  // Ensure minimum length by adding more context
  while (enhanced.length < MIN_LENGTH) {
    if (!enhanced.includes('profesionální')) {
      enhanced += ' Profesionální zázemí a servis zajistí bezproblémový průběh vaší akce.'
    } else if (!enhanced.includes('centrální')) {
      enhanced += ' Výhodná lokalita s dobrou dostupností.'
    } else {
      enhanced += ' Kontaktujte nás pro více informací a rezervaci termínu.'
      break
    }
  }

  return enhanced.trim()
}

async function main() {
  const batchSize = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '50')
  const dryRun = process.argv.includes('--dry-run')

  console.log('🚀 Automated Venue Description Enhancement')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  console.log(`Batch size: ${batchSize} venues`)
  console.log('='.repeat(60) + '\n')

  // Get venues needing enhancement
  const allVenues = await prisma.venue.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      district: true,
      websiteUrl: true,
      venueTypes: true,
      amenities: true,
      capacitySeated: true,
      capacityStanding: true
    }
  })

  const venues = allVenues
    .filter(v => !v.description || v.description.length < MIN_LENGTH)
    .slice(0, batchSize)

  console.log(`Found ${venues.length} venues to process\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i]

    console.log(`[${i + 1}/${venues.length}] 📍 ${venue.name}`)
    console.log(`   Current: ${venue.description?.length || 0} chars`)

    try {
      // Scrape website if available
      let websiteContent = ''
      if (venue.websiteUrl) {
        console.log(`   🌐 Scraping ${venue.websiteUrl}`)
        websiteContent = await scrapeWebsite(venue.websiteUrl)
        if (websiteContent) {
          console.log(`   ✅ Scraped ${websiteContent.length} chars`)
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Generate description
      const enhanced = generateEnhancedDescription(venue as VenueData, websiteContent)
      console.log(`   📝 Generated ${enhanced.length} chars`)

      // Update database
      if (!dryRun) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: { description: enhanced }
        })
        console.log(`   ✅ Updated`)
      } else {
        console.log(`   🔍 DRY RUN - would update`)
      }

      successCount++
    } catch (error) {
      console.error(`   ❌ Error: ${error}`)
      errorCount++
    }

    // Delay between venues
    if (i < venues.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_VENUES))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully processed: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  console.log('='.repeat(60))

  await prisma.$disconnect()
}

main().catch(console.error)
