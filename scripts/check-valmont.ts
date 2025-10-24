import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkValmont() {
  const venue = await prisma.venue.findFirst({
    where: {
      name: {
        contains: 'Valmont',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true
    }
  })

  if (venue) {
    console.log('✅ Found Le Valmont venue:')
    console.log('ID:', venue.id)
    console.log('Name:', venue.name)
    console.log('Slug:', venue.slug)
    console.log('Images:', venue.images)
    console.log('\n📊 Image Status:')
    if (venue.images && venue.images.length > 0) {
      console.log(`✅ Has ${venue.images.length} images`)
      console.log('First image (used as main):', venue.images[0])
    } else {
      console.log('❌ NO IMAGES - This is why "Image unavailable" shows!')
    }
  } else {
    console.log('❌ No venue found with "Valmont" in name')
  }

  await prisma.$disconnect()
}

checkValmont()
