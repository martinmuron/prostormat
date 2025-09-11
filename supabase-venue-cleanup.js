const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupSupabaseVenues() {
  console.log('🔍 Checking Supabase database structure...')
  
  try {
    // First, let's see what tables exist and what venues are there
    console.log('📊 Checking current venues...')
    
    try {
      const venues = await prisma.venue.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true
        }
      })
      console.log(`Found ${venues.length} venues in Supabase:`)
      venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name} (${venue.slug}) - ${venue.status}`)
      })
    } catch (error) {
      console.log('❌ Error accessing venues table:', error.message)
    }

    // Try to delete venues more safely
    try {
      console.log('\n🗑️ Removing venues...')
      const deleteResult = await prisma.venue.deleteMany({})
      console.log(`✅ Removed ${deleteResult.count} venues from Supabase`)
    } catch (error) {
      console.log('❌ Error deleting venues:', error.message)
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupSupabaseVenues()