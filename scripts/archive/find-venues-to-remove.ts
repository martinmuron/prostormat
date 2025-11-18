import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Partial names to search for
const VENUE_SEARCH_TERMS = [
  'SEN',
  'POP',
  'Airport',
  'Továrna',
  'Vír',
  'MOLO',
  'Lipno',
  'HUB',
  'poli',
  'Jezerka',
  'Aparthotel',
  'Klenici'
]

async function main() {
  console.log('🔍 Searching for venues in production database...\n')

  for (const term of VENUE_SEARCH_TERMS) {
    console.log(`\n📋 Searching for venues containing: "${term}"`)

    const venues = await prisma.venue.findMany({
      where: {
        name: {
          contains: term,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        status: true,
        parentId: true
      }
    })

    if (venues.length > 0) {
      venues.forEach(venue => {
        console.log(`  ✅ Found: "${venue.name}"`)
        console.log(`     - Slug: ${venue.slug}`)
        console.log(`     - Address: ${venue.address || 'N/A'}`)
        console.log(`     - Status: ${venue.status}`)
        console.log(`     - Is Sub-venue: ${venue.parentId ? 'Yes' : 'No'}`)
      })
    } else {
      console.log(`  ❌ No venues found with "${term}"`)
    }
  }

  // Also list ALL venues to see what we have
  console.log('\n\n📊 LISTING ALL VENUES IN DATABASE:\n')
  const allVenues = await prisma.venue.findMany({
    orderBy: { name: 'asc' },
    select: {
      name: true,
      slug: true,
      status: true
    }
  })

  console.log(`Total venues: ${allVenues.length}\n`)
  allVenues.forEach((venue, index) => {
    console.log(`${index + 1}. ${venue.name} (${venue.slug}) [${venue.status}]`)
  })
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
