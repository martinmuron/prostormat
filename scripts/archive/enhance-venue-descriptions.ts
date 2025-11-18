import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

// Configuration
const CONFIG = {
  minDescriptionLength: 600,
  delayBetweenRequests: 2000, // 2 seconds
  dryRun: process.argv.includes('--dry-run'),
  limit: process.argv.includes('--limit')
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
    : undefined,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
}

interface ProcessingLog {
  venueId: string
  venueName: string
  venueSlug: string
  originalDescriptionLength: number
  newDescriptionLength: number
  urlDiscovered: boolean
  websiteUrl: string | null
  success: boolean
  error?: string
  timestamp: string
}

const processingLogs: ProcessingLog[] = []

// Helper function to search for venue website URL
async function searchForVenueWebsite(venueName: string, address: string): Promise<string | null> {
  try {
    const searchQuery = `"${venueName}" ${address} Prague website`
    console.log(`  🔍 Searching for website: ${searchQuery}`)

    // Use DuckDuckGo HTML search (no API key required)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.log(`  ⚠️  Search failed: ${response.statusText}`)
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract first search result URL
    const firstResult = $('.result__a').first().attr('href')
    if (firstResult) {
      // DuckDuckGo wraps URLs, extract the actual URL
      const actualUrl = firstResult.match(/uddg=([^&]+)/)?.[1]
      if (actualUrl) {
        const decodedUrl = decodeURIComponent(actualUrl)
        console.log(`  ✅ Found website: ${decodedUrl}`)
        return decodedUrl
      }
    }

    console.log(`  ⚠️  No website found in search results`)
    return null
  } catch (error) {
    console.error(`  ❌ Error searching for website: ${error}`)
    return null
  }
}

// Helper function to scrape website content
async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    console.log(`  🌐 Scraping website: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove script, style, and nav elements
    $('script, style, nav, header, footer').remove()

    // Extract text from main content areas
    const contentSelectors = [
      'main',
      'article',
      '[class*="content"]',
      '[class*="about"]',
      '[id*="about"]',
      'section',
      'p'
    ]

    let content = ''
    for (const selector of contentSelectors) {
      const text = $(selector).text().trim()
      if (text.length > content.length) {
        content = text
      }
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 5000) // Limit to first 5000 chars

    console.log(`  ✅ Scraped ${content.length} characters`)
    return content
  } catch (error) {
    console.error(`  ❌ Error scraping website: ${error}`)
    return ''
  }
}

// Helper function to generate enhanced description using Claude API
async function generateEnhancedDescription(
  venueName: string,
  existingDescription: string,
  websiteContent: string,
  metadata: {
    address: string
    district?: string | null
    venueTypes: string[]
    amenities: string[]
    capacitySeated?: number | null
    capacityStanding?: number | null
  }
): Promise<string> {
  try {
    if (!CONFIG.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not set in environment variables')
    }

    console.log(`  🤖 Generating enhanced description...`)

    const prompt = `You are a professional copywriter for Prostormat, a Czech event venue marketplace platform.

Your task is to enhance the description of a venue while preserving the existing information.

VENUE INFORMATION:
- Name: ${venueName}
- Address: ${metadata.address}
- District: ${metadata.district || 'N/A'}
- Venue Types: ${metadata.venueTypes.join(', ')}
- Amenities: ${metadata.amenities.join(', ')}
- Capacity (seated): ${metadata.capacitySeated || 'N/A'}
- Capacity (standing): ${metadata.capacityStanding || 'N/A'}

EXISTING DESCRIPTION:
${existingDescription || 'No existing description'}

WEBSITE CONTENT (for additional context):
${websiteContent.slice(0, 3000)}

REQUIREMENTS:
1. Write in CZECH language
2. Minimum 600 characters
3. PRESERVE and ENHANCE the existing description - don't replace it completely
4. Add relevant details from the website content
5. Maintain a professional yet conversational tone
6. Focus on: atmosphere, facilities, suitable events, unique features
7. DO NOT make up information not present in the source materials
8. DO NOT include contact information or booking details
9. Make it compelling and informative for event organizers

Please write the enhanced description in Czech:`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const enhancedDescription = data.content[0].text.trim()

    console.log(`  ✅ Generated ${enhancedDescription.length} characters`)
    return enhancedDescription
  } catch (error) {
    console.error(`  ❌ Error generating description: ${error}`)
    throw error
  }
}

// Main processing function
async function processVenue(venue: any): Promise<void> {
  console.log(`\n📍 Processing: ${venue.name} (${venue.slug})`)
  console.log(`   Current description length: ${venue.description?.length || 0} characters`)

  const log: ProcessingLog = {
    venueId: venue.id,
    venueName: venue.name,
    venueSlug: venue.slug,
    originalDescriptionLength: venue.description?.length || 0,
    newDescriptionLength: 0,
    urlDiscovered: false,
    websiteUrl: venue.websiteUrl,
    success: false,
    timestamp: new Date().toISOString()
  }

  try {
    let websiteUrl = venue.websiteUrl

    // Step 1: Find website URL if missing
    if (!websiteUrl) {
      console.log(`   ⚠️  No website URL - searching...`)
      websiteUrl = await searchForVenueWebsite(venue.name, venue.address)

      if (websiteUrl) {
        log.urlDiscovered = true
        log.websiteUrl = websiteUrl
      } else {
        console.log(`   ⚠️  Could not find website URL - will use existing data only`)
      }

      // Add delay after search
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests))
    }

    // Step 2: Scrape website content
    let websiteContent = ''
    if (websiteUrl) {
      websiteContent = await scrapeWebsiteContent(websiteUrl)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Step 3: Generate enhanced description
    const enhancedDescription = await generateEnhancedDescription(
      venue.name,
      venue.description || '',
      websiteContent,
      {
        address: venue.address,
        district: venue.district,
        venueTypes: venue.venueTypes,
        amenities: venue.amenities,
        capacitySeated: venue.capacitySeated,
        capacityStanding: venue.capacityStanding
      }
    )

    log.newDescriptionLength = enhancedDescription.length

    // Step 4: Update database (unless dry-run)
    if (!CONFIG.dryRun) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: {
          description: enhancedDescription,
          ...(log.urlDiscovered && websiteUrl ? { websiteUrl } : {})
        }
      })
      console.log(`   ✅ Updated in database`)
    } else {
      console.log(`   🔍 DRY RUN - would update database with:`)
      console.log(`      New description: ${enhancedDescription.slice(0, 100)}...`)
      if (log.urlDiscovered && websiteUrl) {
        console.log(`      New website URL: ${websiteUrl}`)
      }
    }

    log.success = true

  } catch (error) {
    console.error(`   ❌ Error processing venue: ${error}`)
    log.error = String(error)
  }

  processingLogs.push(log)

  // Add delay between venues
  await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests))
}

// Save logs to file
function saveLogs(): void {
  const logsDir = join(process.cwd(), 'logs')
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logFile = join(logsDir, `venue-description-enhancements-${timestamp}.json`)

  const summary = {
    processedAt: new Date().toISOString(),
    config: CONFIG,
    summary: {
      totalProcessed: processingLogs.length,
      successful: processingLogs.filter(l => l.success).length,
      failed: processingLogs.filter(l => !l.success).length,
      urlsDiscovered: processingLogs.filter(l => l.urlDiscovered).length,
      averageOriginalLength: Math.round(
        processingLogs.reduce((sum, l) => sum + l.originalDescriptionLength, 0) / processingLogs.length
      ),
      averageNewLength: Math.round(
        processingLogs.reduce((sum, l) => sum + l.newDescriptionLength, 0) / processingLogs.length
      )
    },
    logs: processingLogs
  }

  writeFileSync(logFile, JSON.stringify(summary, null, 2))
  console.log(`\n📊 Logs saved to: ${logFile}`)
}

// Print summary
function printSummary(): void {
  const successful = processingLogs.filter(l => l.success).length
  const failed = processingLogs.filter(l => !l.success).length
  const urlsDiscovered = processingLogs.filter(l => l.urlDiscovered).length

  console.log('\n' + '='.repeat(60))
  console.log('📊 PROCESSING SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total venues processed: ${processingLogs.length}`)
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`🔍 URLs discovered: ${urlsDiscovered}`)
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN (no changes made)' : 'LIVE UPDATE'}`)
  console.log('='.repeat(60))
}

// Main execution
async function main() {
  console.log('🚀 Venue Description Enhancement Agent')
  console.log('=' .repeat(60))
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`)
  console.log(`Minimum description length: ${CONFIG.minDescriptionLength} characters`)
  if (CONFIG.limit) {
    console.log(`Processing limit: ${CONFIG.limit} venues`)
  }
  console.log('='.repeat(60))

  try {
    // Query all active venues (Prisma doesn't support length filtering in WHERE clause)
    const allVenues = await prisma.venue.findMany({
      where: {
        status: 'active' // Only process active venues
      },
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

    // Filter venues with short descriptions and apply limit
    const venuesToProcess = allVenues
      .filter(v => !v.description || v.description.length < CONFIG.minDescriptionLength)
      .slice(0, CONFIG.limit)

    console.log(`\n Found ${venuesToProcess.length} venues with descriptions < ${CONFIG.minDescriptionLength} characters\n`)

    if (venuesToProcess.length === 0) {
      console.log('✅ All venues already have adequate descriptions!')
      return
    }

    // Process each venue
    for (const venue of venuesToProcess) {
      await processVenue(venue)
    }

    // Save logs and print summary
    saveLogs()
    printSummary()

  } catch (error) {
    console.error('❌ Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
