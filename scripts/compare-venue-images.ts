import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

const prisma = new PrismaClient()

async function compareVenues() {
  // Get Le Valmont
  const valmont = await prisma.venue.findFirst({
    where: { name: { contains: 'Valmont', mode: 'insensitive' } },
    select: { id: true, name: true, images: true }
  })

  // Get a working venue (one that has images showing)
  const workingVenue = await prisma.venue.findFirst({
    where: {
      images: { isEmpty: false },
      NOT: { name: { contains: 'Valmont', mode: 'insensitive' } }
    },
    select: { id: true, name: true, images: true }
  })

  console.log('🔍 Comparing image paths:\n')

  console.log('❌ Le Valmont (NOT showing):')
  console.log('Images:', valmont?.images)

  console.log('\n✅ Working venue (' + workingVenue?.name + '):')
  console.log('Images:', workingVenue?.images)

  await prisma.$disconnect()
}

compareVenues()
