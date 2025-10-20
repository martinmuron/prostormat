import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

// Helper function to scrape website content
async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    console.log(`  🌐 Scraping: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return ''
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $('script, style, nav, header, footer').remove()

    const contentSelectors = ['main', 'article', '[class*="content"]', '[class*="about"]', '[id*="about"]', 'section', 'p']

    let content = ''
    for (const selector of contentSelectors) {
      const text = $(selector).text().trim()
      if (text.length > content.length) {
        content = text
      }
    }

    content = content.replace(/\s+/g, ' ').trim().slice(0, 3000)
    console.log(`  ✅ Scraped ${content.length} characters`)
    return content
  } catch (error) {
    console.log(`  ⚠️  Could not scrape: ${error}`)
    return ''
  }
}

async function main() {
  const limit = process.argv.includes('--limit')
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
    : 10

  console.log('🔍 Finding venues with short descriptions...\n')

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
    .filter(v => !v.description || v.description.length < 600)
    .slice(0, limit)

  console.log(`Found ${venues.length} venues needing enhancement\n`)

  const venuesData = []

  for (const venue of venues) {
    console.log(`📍 ${venue.name}`)
    console.log(`   Current: ${venue.description?.length || 0} chars`)

    let websiteContent = ''
    if (venue.websiteUrl) {
      websiteContent = await scrapeWebsiteContent(venue.websiteUrl)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    venuesData.push({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      currentDescription: venue.description || '',
      currentLength: venue.description?.length || 0,
      address: venue.address,
      district: venue.district,
      websiteUrl: venue.websiteUrl,
      websiteContent,
      venueTypes: venue.venueTypes,
      amenities: venue.amenities,
      capacitySeated: venue.capacitySeated,
      capacityStanding: venue.capacityStanding
    })
  }

  // Save venue data to JSON file
  const outputFile = join(process.cwd(), 'venues-to-enhance.json')
  writeFileSync(outputFile, JSON.stringify(venuesData, null, 2))

  console.log(`\n✅ Saved venue data to: venues-to-enhance.json`)
  console.log(`\nNext: Claude Code will read this file and generate enhanced descriptions`)

  await prisma.$disconnect()
}

main().catch(console.error)
