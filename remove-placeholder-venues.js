const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeAllVenues() {
  console.log('🗑️  Removing all placeholder venues...')
  
  try {
    // First remove related records to avoid foreign key constraints
    const deleteBroadcastLogs = await prisma.venueBroadcastLog.deleteMany({})
    console.log(`Removed ${deleteBroadcastLogs.count} venue broadcast logs`)
    
    const deleteInquiries = await prisma.venueInquiry.deleteMany({})
    console.log(`Removed ${deleteInquiries.count} venue inquiries`)
    
    const deleteSubscriptions = await prisma.subscription.deleteMany({})
    console.log(`Removed ${deleteSubscriptions.count} subscriptions`)
    
    // Now remove all venues
    const deleteVenues = await prisma.venue.deleteMany({})
    console.log(`Removed ${deleteVenues.count} venues`)
    
    console.log('✅ All placeholder venues removed successfully!')
    
  } catch (error) {
    console.error('❌ Error removing venues:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

removeAllVenues()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })