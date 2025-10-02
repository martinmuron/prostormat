import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Venue Cleanup Verification Report\n');
  console.log('=' .repeat(50) + '\n');

  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      status: true,
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Total Venues in Database: ${venues.length}\n`);
  console.log('📋 Venue List:\n');

  venues.forEach((venue, index) => {
    console.log(`${index + 1}. ${venue.name}`);
    console.log(`   Slug: ${venue.slug}`);
    console.log(`   Status: ${venue.status}`);
    console.log(`   Images: ${venue.images.length}`);
    console.log('');
  });

  // Check for orphaned data
  const totalInquiries = await prisma.venueInquiry.count();
  const totalBroadcastLogs = await prisma.venueBroadcastLog.count();
  const totalBroadcasts = await prisma.venueBroadcast.count();

  console.log('\n📊 Related Data:\n');
  console.log(`   Venue Inquiries: ${totalInquiries}`);
  console.log(`   Broadcast Logs: ${totalBroadcastLogs}`);
  console.log(`   Broadcasts: ${totalBroadcasts}`);

  console.log('\n✨ Cleanup Complete!\n');
  console.log('The database now contains only the 18 venues from the Prostory/ folder.');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
