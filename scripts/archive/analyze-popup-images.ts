import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeImages() {
  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: 'pop-up-bar' }
    })
    
    if (!venue) {
      console.log('Venue not found')
      return
    }
    
    console.log('\n=== IMAGE PATH ANALYSIS ===\n')
    console.log('Images stored in database:')
    venue.images.forEach((img: string, idx: number) => {
      console.log('  ' + (idx + 1) + '. ' + img)
    })
    
    console.log('\n=== EXPECTED VS ACTUAL ===\n')
    console.log('Expected format: prostory_images/pop-up-bar/image_pop-up-bar_1.jpg')
    console.log('Actual format:  /prostory_images/pop-up-bar/image_pop-up-bar_1.jpg')
    console.log('\nNote: Leading slash might cause issues with Supabase storage')
    
    console.log('\n=== DISTRICT ANALYSIS ===\n')
    console.log('Address: Na Prikope 3')
    console.log('District: NULL')
    console.log('Expected: Praha 1')
    
    const venuesWithSlashImages = await prisma.venue.findMany({
      where: {
        status: { in: ['active', 'published'] }
      },
      select: {
        slug: true,
        name: true,
        images: true
      },
      take: 100
    })
    
    const withLeadingSlash = venuesWithSlashImages.filter(v => 
      v.images && v.images.length > 0 && v.images[0].startsWith('/')
    )
    
    console.log('\n=== OTHER VENUES WITH LEADING SLASH ===\n')
    console.log('Found ' + withLeadingSlash.length + ' venues with leading slash')
    withLeadingSlash.slice(0, 20).forEach(v => {
      console.log('  - ' + v.name + ' (' + v.slug + ')')
      console.log('    First image: ' + v.images[0])
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeImages()
