import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Use DATABASE_URL directly - it should already have correct parameters
const prisma = new PrismaClient()

async function exportVenuesMissingDistricts() {
  console.log('🔍 Finding venues with missing districts...\n')

  try {
    const venues = await prisma.venue.findMany({
      where: {
        status: 'published',
        OR: [
          { district: null },
          { district: '' }
        ]
      },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        district: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`✅ Found ${venues.length} venues\n`)

    // Save as JSON
    const jsonPath = join(process.cwd(), 'venues_missing_districts.json')
    writeFileSync(jsonPath, JSON.stringify(venues, null, 2), 'utf-8')
    console.log(`📝 Exported to: ${jsonPath}\n`)

    // Also print them
    console.log('Venues:')
    venues.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`)
      console.log(`   Slug: ${v.slug}`)
      console.log(`   Address: ${v.address}\n`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportVenuesMissingDistricts()
