const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVenues() {
  console.log('📊 Checking current venues in database...')
  
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        venueType: true,
        capacitySeated: true,
        capacityStanding: true,
        status: true,
        createdAt: true,
        manager: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n✅ Found ${venues.length} venues in database:`)
    console.log('='.repeat(80))
    
    venues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`)
      console.log(`   Slug: ${venue.slug}`)
      console.log(`   Type: ${venue.venueType}`)
      console.log(`   Capacity: ${venue.capacitySeated} seated / ${venue.capacityStanding} standing`)
      console.log(`   Status: ${venue.status}`)
      console.log(`   Manager: ${venue.manager.name} (${venue.manager.email})`)
      console.log(`   Created: ${venue.createdAt.toLocaleDateString()}`)
      console.log('-'.repeat(40))
    })
    
    console.log(`\n🎉 Database now contains ${venues.length} real venues from your Prostory documents!`)
    
  } catch (error) {
    console.error('❌ Error checking venues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVenues()