import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Exact slugs or search patterns for venues to remove
const VENUES_TO_REMOVE_BY_PATTERN = [
  // POP Airport and all its sub-venues
  { pattern: 'POP Airport', type: 'contains' },
  { pattern: 'pop-airport', type: 'slug_contains' },

  // Hotel SEN (might be part of another venue name)
  { pattern: 'Hotel SEN', type: 'exact' },
  { pattern: 'hotel-sen', type: 'slug_exact' },

  // Továrna Vír
  { pattern: 'Továrna Vír', type: 'exact' },
  { pattern: 'tovarna-vir', type: 'slug_exact' },

  // MOLO Lipno
  { pattern: 'MOLO Lipno', type: 'exact' },
  { pattern: 'molo-lipno', type: 'slug_exact' },

  // HUB na poli
  { pattern: 'HUB na poli', type: 'exact' },
  { pattern: 'hub-na-poli', type: 'slug_exact' },

  // Hotel Jezerka
  { pattern: 'Hotel Jezerka', type: 'exact' },
  { pattern: 'hotel-jezerka', type: 'slug_exact' },

  // Aparthotel na Klenici
  { pattern: 'Aparthotel na Klenici', type: 'exact' },
  { pattern: 'aparthotel-na-klenici', type: 'slug_exact' },
]

async function deleteVenueImages(slug: string) {
  const imageDir = path.join(process.cwd(), 'prostory', 'prostory_images', slug)

  if (fs.existsSync(imageDir)) {
    console.log(`  📁 Deleting image directory: ${imageDir}`)
    try {
      fs.rmSync(imageDir, { recursive: true, force: true })
      console.log(`  ✅ Deleted image directory for ${slug}`)
    } catch (error) {
      console.error(`  ❌ Error deleting images: ${error}`)
    }
  } else {
    console.log(`  ℹ️  No image directory found for ${slug}`)
  }
}

async function removeVenueById(venueId: string, venueName: string, venueSlug: string, isSubVenue: boolean) {
  const prefix = isSubVenue ? '    ' : '  '

  try {
    // Delete related records first (due to foreign key constraints)

    // Delete venue broadcast logs
    const broadcastLogs = await prisma.venueBroadcastLog.deleteMany({
      where: { venueId }
    })
    if (broadcastLogs.count > 0) {
      console.log(`${prefix}🗑️  Deleted ${broadcastLogs.count} broadcast logs`)
    }

    // Delete venue inquiries
    const inquiries = await prisma.venueInquiry.deleteMany({
      where: { venueId }
    })
    if (inquiries.count > 0) {
      console.log(`${prefix}🗑️  Deleted ${inquiries.count} inquiries`)
    }

    // Delete venue claims
    const claims = await prisma.venueClaim.deleteMany({
      where: { venueId }
    })
    if (claims.count > 0) {
      console.log(`${prefix}🗑️  Deleted ${claims.count} claims`)
    }

    // Delete homepage venue entry
    const homepageVenue = await prisma.homepageVenue.deleteMany({
      where: { venueId }
    })
    if (homepageVenue.count > 0) {
      console.log(`${prefix}🗑️  Deleted homepage venue entry`)
    }

    // Delete subscription if exists
    const subscription = await prisma.subscription.deleteMany({
      where: { venueId }
    })
    if (subscription.count > 0) {
      console.log(`${prefix}🗑️  Deleted subscription`)
    }

    // Delete images from filesystem
    await deleteVenueImages(venueSlug)

    // Finally, delete the venue itself
    await prisma.venue.delete({
      where: { id: venueId }
    })

    console.log(`${prefix}✅ Successfully deleted venue: ${venueName}`)
  } catch (error) {
    console.error(`${prefix}❌ Error deleting venue ${venueName}:`, error)
  }
}

async function findAndRemoveVenues() {
  console.log('🔍 Searching for venues to remove...\n')

  // Find all venues matching our patterns
  const venuesToDelete: Array<{ id: string; name: string; slug: string; parentId: string | null }> = []

  // Search for venues containing "POP Airport" or with slug containing "pop-airport"
  const popAirportVenues = await prisma.venue.findMany({
    where: {
      OR: [
        { name: { contains: 'POP Airport', mode: 'insensitive' } },
        { slug: { contains: 'pop-airport' } }
      ]
    },
    select: { id: true, name: true, slug: true, parentId: true }
  })
  venuesToDelete.push(...popAirportVenues)

  // Search for exact matches
  const exactMatches = await prisma.venue.findMany({
    where: {
      OR: [
        { name: { equals: 'Hotel SEN', mode: 'insensitive' } },
        { name: { equals: 'Továrna Vír', mode: 'insensitive' } },
        { name: { equals: 'MOLO Lipno', mode: 'insensitive' } },
        { name: { equals: 'HUB na poli', mode: 'insensitive' } },
        { name: { equals: 'Hotel Jezerka', mode: 'insensitive' } },
        { name: { equals: 'Aparthotel na Klenici', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, slug: true, parentId: true }
  })
  venuesToDelete.push(...exactMatches)

  // Remove duplicates
  const uniqueVenues = Array.from(
    new Map(venuesToDelete.map(v => [v.id, v])).values()
  )

  console.log(`Found ${uniqueVenues.length} venues to delete:\n`)
  uniqueVenues.forEach(venue => {
    console.log(`  - ${venue.name} (${venue.slug}) ${venue.parentId ? '[SUB-VENUE]' : '[MAIN VENUE]'}`)
  })

  if (uniqueVenues.length === 0) {
    console.log('No venues found to delete.')
    return
  }

  console.log('\n' + '='.repeat(60))
  console.log('Starting deletion process...\n')

  // Delete venues (main venues first, then sub-venues will be automatically handled)
  for (const venue of uniqueVenues) {
    console.log(`\n🗑️  Removing: ${venue.name}`)
    await removeVenueById(venue.id, venue.name, venue.slug, !!venue.parentId)
  }
}

async function main() {
  console.log('🚀 Starting remaining venue cleanup...\n')
  console.log('=' .repeat(60))

  await findAndRemoveVenues()

  console.log('\n' + '='.repeat(60))
  console.log('✅ All operations completed!')
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
