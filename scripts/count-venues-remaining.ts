import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const allVenues = await prisma.venue.findMany({
    where: { status: 'active' },
    select: { description: true }
  })

  const needsEnhancement = allVenues.filter(v =>
    !v.description || v.description.length < 600
  )

  console.log(`\n📊 VENUE ENHANCEMENT PROGRESS`)
  console.log('='.repeat(60))
  console.log(`Total active venues: ${allVenues.length}`)
  console.log(`✅ Already enhanced (>=600 chars): ${allVenues.length - needsEnhancement.length}`)
  console.log(`⏳ Still needs enhancement (<600 chars): ${needsEnhancement.length}`)
  console.log('='.repeat(60))

  await prisma.$disconnect()
}

main()
