import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Venues to remove completely
const VENUES_TO_REMOVE = [
  'Hotel SEN',
  'POP Airport',
  'Továrna Vír',
  'MOLO Lipno',
  'Golf Park Slapy',
  'Volmanova vila',
  'HUB na poli',
  'Keltské oppidum Závist',
  'Resort Cedrus',
  'Uhelný mlýn loft',
  'Hotel Jezerka',
  'Aparthotel na Klenici',
  'Meandr Řevnice'
]

// Address corrections
const ADDRESS_CORRECTIONS = [
  { name: 'Medusa Prague', newAddress: 'Melantrichova 5, Praha 1' },
  { name: 'Ribs of Prague', newAddress: 'Melantrichova 5, Praha 1' }
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

async function removeVenue(venueName: string) {
  console.log(`\n🔍 Looking for venue: ${venueName}`)

  // Find the venue (case-insensitive search)
  const venue = await prisma.venue.findFirst({
    where: {
      name: {
        equals: venueName,
        mode: 'insensitive'
      }
    },
    include: {
      subVenues: true
    }
  })

  if (!venue) {
    console.log(`  ⚠️  Venue "${venueName}" not found in database`)
    return
  }

  console.log(`  📍 Found: ${venue.name} (ID: ${venue.id}, Slug: ${venue.slug})`)

  // If venue has sub-venues, delete them first
  if (venue.subVenues && venue.subVenues.length > 0) {
    console.log(`  🏢 Venue has ${venue.subVenues.length} sub-venues, removing them first...`)
    for (const subVenue of venue.subVenues) {
      await removeVenueById(subVenue.id, subVenue.name, subVenue.slug, true)
    }
  }

  // Now remove the main venue
  await removeVenueById(venue.id, venue.name, venue.slug, false)
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

async function fixVenueAddress(venueName: string, newAddress: string) {
  console.log(`\n🔍 Looking for venue to fix address: ${venueName}`)

  const venue = await prisma.venue.findFirst({
    where: {
      name: {
        equals: venueName,
        mode: 'insensitive'
      }
    }
  })

  if (!venue) {
    console.log(`  ⚠️  Venue "${venueName}" not found in database`)
    return
  }

  console.log(`  📍 Found: ${venue.name}`)
  console.log(`  📝 Current address: ${venue.address}`)
  console.log(`  📝 New address: ${newAddress}`)

  try {
    await prisma.venue.update({
      where: { id: venue.id },
      data: { address: newAddress }
    })
    console.log(`  ✅ Successfully updated address for ${venueName}`)
  } catch (error) {
    console.error(`  ❌ Error updating address:`, error)
  }
}

async function main() {
  console.log('🚀 Starting venue cleanup and address fixes...\n')
  console.log('=' .repeat(60))

  // Remove venues
  console.log('\n📋 PHASE 1: REMOVING VENUES\n')
  for (const venueName of VENUES_TO_REMOVE) {
    await removeVenue(venueName)
  }

  // Fix addresses
  console.log('\n📋 PHASE 2: FIXING ADDRESSES\n')
  for (const correction of ADDRESS_CORRECTIONS) {
    await fixVenueAddress(correction.name, correction.newAddress)
  }

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
