import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const allVenues = await prisma.venue.findMany({
    where: { status: 'active' },
    select: { description: true }
  })

  const enhanced = allVenues.filter(v => v.description && v.description.length >= 600)
  const needsWork = allVenues.filter(v => !v.description || v.description.length < 600)

  console.log('\n📊 VENUE ENHANCEMENT PROGRESS')
  console.log('='.repeat(70))
  console.log(`Total active venues: ${allVenues.length}`)
  console.log(`✅ Enhanced (>=600 chars): ${enhanced.length} (${Math.round(enhanced.length / allVenues.length * 100)}%)`)
  console.log(`⏳ Still needs work (<600 chars): ${needsWork.length} (${Math.round(needsWork.length / allVenues.length * 100)}%)`)
  console.log('='.repeat(70))

  const avgLength = Math.round(
    allVenues.filter(v => v.description).reduce((sum, v) => sum + (v.description?.length || 0), 0) /
    allVenues.filter(v => v.description).length
  )
  console.log(`Average description length: ${avgLength} characters`)
  console.log('='.repeat(70) + '\n')

  await prisma.$disconnect()
}

main()
