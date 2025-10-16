import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// EXACTLY the venues user requested to remove
const VENUES_TO_REMOVE = [
  'Golf Park Slapy',
  'Volmanova vila',
  'Keltské oppidum Závist',
  'Resort Cedrus',
  'Uhelný Mlýn Loft',
  'Meandr Řevnice'
]

// POP Airport sub-venues (check if they exist)
const POP_AIRPORT_CHECK = ['pop-airport']

// Address corrections requested by user
const ADDRESS_FIXES = [
  { name: 'Medusa Prague', newAddress: 'Melantrichova 5, Praha 1' },
  { name: 'Ribs of Prague', newAddress: 'Melantrichova 5, Praha 1' },
  { name: 'THE POP UP', newAddress: 'Na Příkopě 3' }
]

async function deleteVenueImages(slug: string) {
  const imageDir = path.join(process.cwd(), 'prostory', 'prostory_images', slug)
  if (fs.existsSync(imageDir)) {
    console.log(`  📁 Will delete image directory: ${imageDir}`)
    try {
      fs.rmSync(imageDir, { recursive: true, force: true })
      console.log(`  ✅ Deleted image directory`)
    } catch (error) {
      console.error(`  ❌ Error deleting images: ${error}`)
    }
  }
}

async function removeVenueById(venueId: string, venueName: string, venueSlug: string) {
  try {
    // Delete related records (safe - respects foreign keys)
    const broadcastLogs = await prisma.venueBroadcastLog.deleteMany({ where: { venueId } })
    if (broadcastLogs.count > 0) console.log(`  🗑️  Deleted ${broadcastLogs.count} broadcast logs`)

    const inquiries = await prisma.venueInquiry.deleteMany({ where: { venueId } })
    if (inquiries.count > 0) console.log(`  🗑️  Deleted ${inquiries.count} inquiries`)

    const claims = await prisma.venueClaim.deleteMany({ where: { venueId } })
    if (claims.count > 0) console.log(`  🗑️  Deleted ${claims.count} claims`)

    const homepageVenue = await prisma.homepageVenue.deleteMany({ where: { venueId } })
    if (homepageVenue.count > 0) console.log(`  🗑️  Deleted homepage entry`)

    const subscription = await prisma.subscription.deleteMany({ where: { venueId } })
    if (subscription.count > 0) console.log(`  🗑️  Deleted subscription`)

    // Delete images
    await deleteVenueImages(venueSlug)

    // Delete venue
    await prisma.venue.delete({ where: { id: venueId } })
    console.log(`  ✅ Successfully deleted venue: ${venueName}`)
  } catch (error) {
    console.error(`  ❌ Error deleting venue ${venueName}:`, error)
  }
}

async function main() {
  console.log('🚀 APPLYING FIXES TO LIVE DATABASE (PORT 5432)\n')
  console.log('⚠️  DRY RUN MODE - Showing what will be changed...\n')
  console.log('='.repeat(60))

  // PHASE 1: Check venues to remove
  console.log('\n📋 PHASE 1: VENUES TO REMOVE\n')
  const venuesToDelete: Array<{ id: string; name: string; slug: string }> = []

  for (const name of VENUES_TO_REMOVE) {
    const venue = await prisma.venue.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true, name: true, slug: true }
    })
    if (venue) {
      console.log(`✓ Found: ${venue.name} (${venue.slug})`)
      venuesToDelete.push(venue)
    } else {
      console.log(`✗ Not found: ${name} (already removed or doesn't exist)`)
    }
  }

  // Check POP Airport venues
  const popAirportVenues = await prisma.venue.findMany({
    where: { slug: { contains: 'pop-airport' } },
    select: { id: true, name: true, slug: true }
  })
  if (popAirportVenues.length > 0) {
    console.log(`\n✓ Found ${popAirportVenues.length} POP Airport sub-venues:`)
    popAirportVenues.forEach(v => {
      console.log(`  - ${v.name} (${v.slug})`)
      venuesToDelete.push(v)
    })
  }

  // PHASE 2: Check addresses to fix
  console.log('\n📋 PHASE 2: ADDRESSES TO FIX\n')
  const addressUpdates: Array<{ id: string; name: string; oldAddress: string; newAddress: string }> = []

  for (const fix of ADDRESS_FIXES) {
    const venue = await prisma.venue.findFirst({
      where: { name: { contains: fix.name, mode: 'insensitive' } },
      select: { id: true, name: true, address: true }
    })
    if (venue) {
      if (venue.address !== fix.newAddress) {
        console.log(`✓ ${venue.name}`)
        console.log(`  OLD: ${venue.address}`)
        console.log(`  NEW: ${fix.newAddress}`)
        addressUpdates.push({
          id: venue.id,
          name: venue.name,
          oldAddress: venue.address || '',
          newAddress: fix.newAddress
        })
      } else {
        console.log(`✓ ${venue.name} - Already correct`)
      }
    } else {
      console.log(`✗ Not found: ${fix.name}`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 SUMMARY:')
  console.log(`  Venues to remove: ${venuesToDelete.length}`)
  console.log(`  Addresses to update: ${addressUpdates.length}`)

  console.log('\n⚠️  This was a DRY RUN. No changes were made.')
  console.log('✅ Ready to apply changes when you confirm.')

  // Now apply changes
  console.log('\n' + '='.repeat(60))
  console.log('\n🔧 APPLYING CHANGES...\n')

  // Remove venues
  if (venuesToDelete.length > 0) {
    console.log(`\n🗑️  Removing ${venuesToDelete.length} venues...`)
    for (const venue of venuesToDelete) {
      console.log(`\n  Removing: ${venue.name}`)
      await removeVenueById(venue.id, venue.name, venue.slug)
    }
  }

  // Fix addresses
  if (addressUpdates.length > 0) {
    console.log(`\n📝 Updating ${addressUpdates.length} addresses...`)
    for (const update of addressUpdates) {
      try {
        await prisma.venue.update({
          where: { id: update.id },
          data: { address: update.newAddress }
        })
        console.log(`  ✅ Updated ${update.name}`)
      } catch (error) {
        console.error(`  ❌ Error updating ${update.name}:`, error)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ ALL FIXES APPLIED TO LIVE DATABASE!')
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
