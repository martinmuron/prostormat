import { db } from '../src/lib/db'

async function exportVenueCategories() {
  try {
    const venues = await db.venue.findMany({
      where: {
        status: { in: ['published', 'active', 'hidden'] }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        venueType: true,
        address: true,
        description: true,
        websiteUrl: true,
        status: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n=== VENUE CATEGORY AUDIT ===\n')
    console.log(`Total venues: ${venues.length}\n`)

    // Group by category
    const byCategory: Record<string, typeof venues> = {}
    const noCategory: typeof venues = []

    venues.forEach(venue => {
      if (venue.venueType) {
        if (!byCategory[venue.venueType]) {
          byCategory[venue.venueType] = []
        }
        byCategory[venue.venueType].push(venue)
      } else {
        noCategory.push(venue)
      }
    })

    // Display by category
    Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).forEach(([category, venueList]) => {
      console.log(`\n📁 ${category.toUpperCase()} (${venueList.length} venues)`)
      console.log('─'.repeat(80))
      venueList.forEach(v => {
        console.log(`  • ${v.name}`)
        console.log(`    ├─ Slug: ${v.slug}`)
        console.log(`    ├─ Address: ${v.address}`)
        if (v.websiteUrl) {
          console.log(`    ├─ Website: ${v.websiteUrl}`)
        }
        if (v.description) {
          const shortDesc = v.description.substring(0, 100).replace(/\n/g, ' ')
          console.log(`    └─ Description: ${shortDesc}${v.description.length > 100 ? '...' : ''}`)
        }
        console.log()
      })
    })

    // Display venues without category
    if (noCategory.length > 0) {
      console.log(`\n⚠️  NO CATEGORY (${noCategory.length} venues)`)
      console.log('─'.repeat(80))
      noCategory.forEach(v => {
        console.log(`  • ${v.name}`)
        console.log(`    ├─ Slug: ${v.slug}`)
        console.log(`    └─ Address: ${v.address}`)
        console.log()
      })
    }

    // Summary statistics
    console.log('\n📊 SUMMARY')
    console.log('─'.repeat(80))
    console.log(`Total venues: ${venues.length}`)
    console.log(`With category: ${venues.length - noCategory.length}`)
    console.log(`Without category: ${noCategory.length}`)
    console.log('\nCategories breakdown:')
    Object.entries(byCategory)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([cat, list]) => {
        console.log(`  ${cat}: ${list.length}`)
      })

    // Export to JSON for easier editing
    const exportData = venues.map(v => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      currentCategory: v.venueType || null,
      suggestedCategories: [], // Admin will fill this in
      address: v.address,
      websiteUrl: v.websiteUrl,
    }))

    const fs = require('fs')
    const path = require('path')
    const exportPath = path.join(__dirname, '../VENUE_CATEGORIES_REVIEW.json')
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))

    console.log(`\n✅ Exported to: ${exportPath}`)
    console.log('   You can edit this file and use it for bulk updates.\n')

  } catch (error) {
    console.error('Error exporting venues:', error)
  } finally {
    await db.$disconnect()
  }
}

exportVenueCategories()
