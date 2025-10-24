import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixValmontImages() {
  const venue = await prisma.venue.findFirst({
    where: { name: { contains: 'Valmont', mode: 'insensitive' } },
    select: { id: true, name: true, images: true }
  })

  if (!venue) {
    console.log('❌ Venue not found')
    return
  }

  console.log('🔧 Fixing Le Valmont image paths...\n')
  console.log('Current paths:', venue.images)

  // Remove /prostory_images/ prefix from all paths
  const fixedImages = venue.images.map((img: string) =>
    img.replace('/prostory_images/', '')
  )

  console.log('\nFixed paths:', fixedImages)

  // Update the venue
  await prisma.venue.update({
    where: { id: venue.id },
    data: { images: fixedImages }
  })

  console.log('\n✅ Successfully updated Le Valmont image paths!')
  console.log('The main image should now display correctly.')

  await prisma.$disconnect()
}

fixValmontImages()
