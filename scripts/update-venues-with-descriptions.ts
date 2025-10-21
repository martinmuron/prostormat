import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING || "postgres://postgres.hlwgpjdhhjaibkqcyjts:yJYklwqJD8YO5mne@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    }
  }
})

interface EnhancedVenue {
  id: string
  slug: string
  description: string
  venueTypes: string[]
}

async function main() {
  const inputFile = process.argv[2]

  if (!inputFile) {
    console.error('Usage: npx tsx scripts/update-venues-with-descriptions.ts <input-file.json>')
    process.exit(1)
  }

  console.log('📝 Updating Venues with Enhanced Descriptions')
  console.log('='.repeat(70))
  console.log(`Reading from: ${inputFile}`)
  console.log('Database: LIVE (port 5432)')
  console.log('='.repeat(70) + '\n')

  const data = JSON.parse(readFileSync(inputFile, 'utf-8'))
  const venues: EnhancedVenue[] = data.venues || data

  console.log(`Updating ${venues.length} venues\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i]

    try {
      console.log(`[${i + 1}/${venues.length}] ${venue.slug}`)
      console.log(`  Description: ${venue.description.length} chars`)
      console.log(`  Categories: ${venue.venueTypes.join(', ')}`)

      await prisma.venue.update({
        where: { id: venue.id },
        data: {
          description: venue.description,
          venueTypes: venue.venueTypes
        }
      })

      console.log(`  ✅ Updated`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Error: ${error}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 UPDATE SUMMARY')
  console.log('='.repeat(70))
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log('='.repeat(70))

  await prisma.$disconnect()
}

main().catch(console.error)
