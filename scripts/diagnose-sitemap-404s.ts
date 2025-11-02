/**
 * Sitemap 404 Diagnostic Tool
 *
 * This script identifies venues in your sitemap that return 404 errors,
 * helping you understand why Google Search Console reports indexing issues.
 *
 * Usage:
 *   npx tsx scripts/diagnose-sitemap-404s.ts
 */

import { db } from '../src/lib/db'

interface SitemapVenue {
  url: string
  slug: string
  lastModified: string
}

interface DiagnosticResult {
  totalInSitemap: number
  totalInDatabase: number
  missingVenues: Array<{
    slug: string
    url: string
    reason: string
  }>
  statusMismatches: Array<{
    slug: string
    currentStatus: string
    shouldBe: 'published' | 'active'
  }>
  duplicateSlugs: Array<{
    slug: string
    count: number
  }>
}

async function fetchSitemapVenues(): Promise<SitemapVenue[]> {
  console.log('📥 Fetching sitemap from production...')

  try {
    const response = await fetch('https://prostormat.cz/sitemap.xml')
    const xmlText = await response.text()

    // Parse venue URLs from sitemap
    const venueUrlRegex = /<loc>https:\/\/prostormat\.cz\/prostory\/([^<]+)<\/loc>/g
    const venues: SitemapVenue[] = []
    let match

    while ((match = venueUrlRegex.exec(xmlText)) !== null) {
      const slug = match[1]
      venues.push({
        url: `https://prostormat.cz/prostory/${slug}`,
        slug: slug,
        lastModified: new Date().toISOString()
      })
    }

    console.log(`✅ Found ${venues.length} venue URLs in sitemap`)
    return venues
  } catch (error) {
    console.error('❌ Failed to fetch sitemap:', error)
    return []
  }
}

async function checkVenueExists(slug: string): Promise<{
  exists: boolean
  status?: string
  id?: string
  name?: string
}> {
  const venue = await db.venue.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      status: true,
      slug: true
    }
  })

  if (!venue) {
    return { exists: false }
  }

  return {
    exists: true,
    status: venue.status,
    id: venue.id,
    name: venue.name
  }
}

async function testVenueUrl(url: string): Promise<{
  httpStatus: number
  hasNoindex: boolean
  title: string
}> {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // Check for noindex in meta tags
    const hasNoindex = html.includes('<meta name="robots" content="noindex"') ||
                       html.includes('content="noindex"')

    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1] : 'Unknown'

    return {
      httpStatus: response.status,
      hasNoindex,
      title
    }
  } catch (error) {
    return {
      httpStatus: 0,
      hasNoindex: false,
      title: 'Error fetching'
    }
  }
}

async function diagnose(): Promise<DiagnosticResult> {
  console.log('\n🔍 SITEMAP 404 DIAGNOSTIC TOOL\n')
  console.log('=' .repeat(60))

  // Step 1: Get venues from sitemap
  const sitemapVenues = await fetchSitemapVenues()

  // Step 2: Get venues from database
  console.log('\n📊 Checking database...')
  const dbVenues = await db.venue.findMany({
    where: {
      status: { in: ['published', 'active'] },
      parentId: null
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true
    }
  })

  console.log(`✅ Found ${dbVenues.length} venues in database (published/active, no parent)`)

  // Step 3: Find all venues regardless of status for comparison
  const allDbVenues = await db.venue.findMany({
    select: {
      slug: true,
      status: true,
      name: true
    }
  })

  const dbVenueMap = new Map(allDbVenues.map(v => [v.slug, v]))

  // Step 4: Check each sitemap venue
  console.log('\n🔎 Checking each sitemap URL...')
  const missingVenues: DiagnosticResult['missingVenues'] = []
  const statusMismatches: DiagnosticResult['statusMismatches'] = []

  let checkedCount = 0
  for (const sitemapVenue of sitemapVenues) {
    checkedCount++

    if (checkedCount % 50 === 0) {
      console.log(`   Progress: ${checkedCount}/${sitemapVenues.length}`)
    }

    const dbVenue = dbVenueMap.get(sitemapVenue.slug)

    if (!dbVenue) {
      // Venue doesn't exist in database at all
      missingVenues.push({
        slug: sitemapVenue.slug,
        url: sitemapVenue.url,
        reason: 'Venue not found in database (may have been deleted)'
      })
    } else if (dbVenue.status !== 'published' && dbVenue.status !== 'active') {
      // Venue exists but has wrong status
      statusMismatches.push({
        slug: sitemapVenue.slug,
        currentStatus: dbVenue.status,
        shouldBe: 'published'
      })

      missingVenues.push({
        slug: sitemapVenue.slug,
        url: sitemapVenue.url,
        reason: `Venue has status "${dbVenue.status}" (should be "published" or "active")`
      })
    }
  }

  // Step 5: Check for duplicate slugs
  const slugCounts = new Map<string, number>()
  for (const venue of allDbVenues) {
    slugCounts.set(venue.slug, (slugCounts.get(venue.slug) || 0) + 1)
  }

  const duplicateSlugs = Array.from(slugCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([slug, count]) => ({ slug, count }))

  return {
    totalInSitemap: sitemapVenues.length,
    totalInDatabase: dbVenues.length,
    missingVenues,
    statusMismatches,
    duplicateSlugs
  }
}

async function main() {
  try {
    const result = await diagnose()

    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('📋 DIAGNOSTIC RESULTS')
    console.log('='.repeat(60))

    console.log(`\n📊 Summary:`)
    console.log(`   • Venues in sitemap: ${result.totalInSitemap}`)
    console.log(`   • Venues in database (published/active): ${result.totalInDatabase}`)
    console.log(`   • Difference: ${Math.abs(result.totalInSitemap - result.totalInDatabase)}`)

    if (result.missingVenues.length > 0) {
      console.log(`\n❌ PROBLEM VENUES (${result.missingVenues.length} found):`)
      console.log('   These venues are in your sitemap but will return 404 errors:\n')

      result.missingVenues.slice(0, 20).forEach((venue, index) => {
        console.log(`   ${index + 1}. ${venue.slug}`)
        console.log(`      URL: ${venue.url}`)
        console.log(`      Reason: ${venue.reason}`)
        console.log('')
      })

      if (result.missingVenues.length > 20) {
        console.log(`   ... and ${result.missingVenues.length - 20} more`)
      }
    } else {
      console.log('\n✅ No missing venues found!')
    }

    if (result.statusMismatches.length > 0) {
      console.log(`\n⚠️  STATUS MISMATCHES (${result.statusMismatches.length} found):`)
      console.log('   These venues exist but have the wrong status:\n')

      result.statusMismatches.slice(0, 10).forEach((venue, index) => {
        console.log(`   ${index + 1}. ${venue.slug}`)
        console.log(`      Current status: "${venue.currentStatus}"`)
        console.log(`      Should be: "${venue.shouldBe}"`)
        console.log('')
      })

      if (result.statusMismatches.length > 10) {
        console.log(`   ... and ${result.statusMismatches.length - 10} more`)
      }
    }

    if (result.duplicateSlugs.length > 0) {
      console.log(`\n🔄 DUPLICATE SLUGS (${result.duplicateSlugs.length} found):`)
      result.duplicateSlugs.forEach((dup) => {
        console.log(`   • "${dup.slug}" appears ${dup.count} times`)
      })
    }

    // Recommendations
    console.log('\n' + '='.repeat(60))
    console.log('💡 RECOMMENDED ACTIONS')
    console.log('='.repeat(60))

    if (result.missingVenues.length > 0) {
      console.log('\n1. Fix or remove venues in sitemap that return 404:')
      console.log('   Run this SQL to see all venue statuses:')
      console.log('   ')
      console.log('   SELECT slug, status, name FROM prostormat_venues')
      console.log(`   WHERE slug IN (${result.missingVenues.slice(0, 5).map(v => `'${v.slug}'`).join(', ')})`)
      console.log('')
      console.log('2. Either:')
      console.log('   a) Update status to "active" or "published" for venues that should be visible')
      console.log('   b) Delete venues that are no longer needed')
      console.log('   c) Change slugs if they were renamed')
    }

    if (result.totalInSitemap !== result.totalInDatabase) {
      console.log('\n3. Regenerate sitemap:')
      console.log('   • Deploy your app to trigger sitemap regeneration')
      console.log('   • Or manually trigger revalidation')
      console.log('   • Verify sitemap count matches database count')
    }

    console.log('\n4. Request Google reindex:')
    console.log('   • Go to Google Search Console')
    console.log('   • Submit the updated sitemap')
    console.log('   • Request re-crawl of affected URLs')

    console.log('\n' + '='.repeat(60))

    // Export to JSON for further analysis
    const fs = await import('fs')
    const outputPath = '/tmp/sitemap-diagnostic-report.json'
    await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2))
    console.log(`\n📄 Full report saved to: ${outputPath}`)

  } catch (error) {
    console.error('❌ Error running diagnostic:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
