#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const remoteDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.')
  }

  process.env.DATABASE_URL = remoteDatabaseUrl
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying new venues...\n')

  // Get all venues
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      parentId: true,
      parent: {
        select: {
          slug: true,
          name: true
        }
      },
      subVenues: {
        select: {
          slug: true,
          name: true,
          images: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 Total venues in database: ${allVenues.length}\n`)

  // Check specific new parent venues
  const newParentVenues = [
    'majaland-praha',
    'pop-airport',
    'dancing-house-hotel',
    'chateau-st-havel'
  ]

  console.log('🏛️  New parent venues with sub-locations:\n')

  for (const slug of newParentVenues) {
    const venue = allVenues.find(v => v.slug === slug)
    if (venue) {
      console.log(`✅ ${venue.name}`)
      console.log(`   - Images: ${venue.images.length}`)
      console.log(`   - Sub-locations: ${venue.subVenues.length}`)
      venue.subVenues.forEach(sub => {
        console.log(`      └─ ${sub.name} (${sub.images.length} images)`)
      })
      console.log()
    } else {
      console.log(`❌ ${slug} - NOT FOUND\n`)
    }
  }

  // Check standalone new venues
  const newStandaloneVenues = [
    'kaunicky-palac',
    'academy-hub-karlovy-vary',
    'alforno-pizza-pasta',
    'demanova-rezort',
    'aparthotel-na-klenici',
    'stodola-unetickeho-pivovaru',
    'mala-sin-galerie-manes',
    'sporthotel-slavia',
    'll-gallery'
  ]

  console.log('🏢 New standalone venues:\n')

  for (const slug of newStandaloneVenues) {
    const venue = allVenues.find(v => v.slug === slug)
    if (venue) {
      console.log(`✅ ${venue.name} - ${venue.images.length} images`)
    } else {
      console.log(`❌ ${slug} - NOT FOUND`)
    }
  }

  console.log()

  // Check for venues with more than 30 images (should be none)
  const venuesWithTooManyImages = allVenues.filter(v => v.images.length > 30)

  if (venuesWithTooManyImages.length > 0) {
    console.log('⚠️  Venues with more than 30 images:')
    venuesWithTooManyImages.forEach(v => {
      console.log(`   - ${v.slug}: ${v.images.length} images`)
    })
  } else {
    console.log('✅ All venues have 30 or fewer images')
  }

  console.log()

  // Check for venues with no images
  const venuesWithNoImages = allVenues.filter(v => v.images.length === 0)

  if (venuesWithNoImages.length > 0) {
    console.log(`⚠️  ${venuesWithNoImages.length} venues have no images:`)
    venuesWithNoImages.slice(0, 10).forEach(v => {
      console.log(`   - ${v.slug}`)
    })
    if (venuesWithNoImages.length > 10) {
      console.log(`   ... and ${venuesWithNoImages.length - 10} more`)
    }
  } else {
    console.log('✅ All venues have at least one image')
  }

  console.log('\n✨ Verification complete!')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
