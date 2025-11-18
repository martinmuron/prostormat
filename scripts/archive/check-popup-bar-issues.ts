import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPopUpBar() {
  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: 'pop-up-bar' }
    })
    
    if (!venue) {
      console.log('Venue not found with slug: pop-up-bar')
      return
    }
    
    console.log('\n=== POP-UP BAR VENUE DATA ===\n')
    console.log('ID:', venue.id)
    console.log('Name:', venue.name)
    console.log('Slug:', venue.slug)
    console.log('Address:', venue.address)
    console.log('District:', venue.district || 'NULL/MISSING')
    console.log('Status:', venue.status)
    console.log('Images:', JSON.stringify(venue.images, null, 2))
    console.log('Images Array Length:', venue.images?.length || 0)
    console.log('Images Type:', typeof venue.images)
    console.log('\n=== CHECKING FOR SIMILAR ISSUES ===\n')
    
    // Check venues missing district
    const missingDistrict = await prisma.venue.findMany({
      where: {
        OR: [
          { district: null },
          { district: '' }
        ],
        status: { in: ['active', 'published'] }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        district: true
      },
      take: 10
    })
    
    console.log('Venues missing district:', missingDistrict.length)
    missingDistrict.forEach(v => {
      console.log('  - ' + v.name + ' (' + v.slug + ')')
      console.log('    Address: ' + v.address)
    })
    
    // Check venues with empty images
    const allVenues = await prisma.venue.findMany({
      where: {
        status: { in: ['active', 'published'] }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        images: true
      }
    })
    
    const venuesWithoutImages = allVenues.filter(v => !v.images || v.images.length === 0)
    
    console.log('\nVenues with empty images:', venuesWithoutImages.length)
    venuesWithoutImages.slice(0, 10).forEach(v => {
      console.log('  - ' + v.name + ' (' + v.slug + ')')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPopUpBar()
