import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { writeFileSync } from 'fs'

config({ path: '.env.local' })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING
    }
  }
})

async function main() {
  console.log('🔍 Getting the actual 93 venues that need enhancement...\n')

  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
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

  const needWork = allVenues.filter(v => !v.description || v.description.length < 600)

  console.log(`Found ${needWork.length} venues needing enhancement`)

  // Sort by description length (shortest first)
  needWork.sort((a, b) => {
    const aLen = a.description?.length || 0
    const bLen = b.description?.length || 0
    return aLen - bLen
  })

  console.log('\n=== VENUES BY DESCRIPTION LENGTH ===')
  const noDesc = needWork.filter(v => !v.description || v.description.length === 0)
  const veryShort = needWork.filter(v => v.description && v.description.length > 0 && v.description.length < 100)
  const short = needWork.filter(v => v.description && v.description.length >= 100 && v.description.length < 300)
  const medium = needWork.filter(v => v.description && v.description.length >= 300 && v.description.length < 600)

  console.log(`No description (0 chars): ${noDesc.length}`)
  console.log(`Very short (1-99 chars): ${veryShort.length}`)
  console.log(`Short (100-299 chars): ${short.length}`)
  console.log(`Medium (300-599 chars): ${medium.length}`)

  // Save to file
  writeFileSync('actual-remaining-93-venues.json', JSON.stringify(needWork, null, 2))
  console.log(`\n✅ Saved ${needWork.length} venues to actual-remaining-93-venues.json`)

  console.log('\n=== SAMPLE (First 20) ===')
  needWork.slice(0, 20).forEach((v, i) => {
    const len = v.description?.length || 0
    const website = v.websiteUrl ? '✓' : '✗'
    console.log(`${(i + 1).toString().padStart(2)}. ${v.slug.padEnd(50)} | ${len.toString().padStart(3)} chars | Web: ${website}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
