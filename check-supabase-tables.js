const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSupabaseTables() {
  console.log('🔍 Checking what tables exist in Supabase...')
  
  try {
    // Check what tables exist in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    console.log('\n📋 Tables found in Supabase:')
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`)
    })

    // If there are venue-related tables, let's check their content
    const venueTable = tables.find(t => t.table_name.toLowerCase().includes('venue'))
    if (venueTable) {
      console.log(`\n🏢 Checking ${venueTable.table_name} content:`)
      try {
        const venueCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM ${venueTable.table_name};
        `
        console.log(`Found ${venueCount[0].count} records in ${venueTable.table_name}`)
      } catch (error) {
        console.log(`❌ Error querying ${venueTable.table_name}:`, error.message)
      }
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSupabaseTables()