import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// The 18 venues we want to keep (based on Prostory/ folder)
const VENUES_TO_KEEP = [
  'alma-prague',
  'arthurs-pub',
  'bar-forbina',
  'bar-monk',
  'bugsys-bar',
  'deer-restaurant',
  'hotel-u-prince',
  'kino-pilotu',
  'm1-lounge',
  'medusa-prague',
  'monkey-bar-prague',
  'nod',
  'ox-club-prague',
  'pytloun-old-armoury',
  'pytloun-sky-bar',
  'ribs-of-prague',
  'spejle-jungmannova',
  'strecha-radost'
];

async function main() {
  console.log('🔍 Starting venue cleanup...\n');

  // Get all venues from database
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      images: true
    }
  });

  console.log(`📊 Total venues in database: ${allVenues.length}`);
  console.log(`✅ Venues to keep: ${VENUES_TO_KEEP.length}\n`);

  // Identify venues to delete
  const venuesToDelete = allVenues.filter(
    venue => !VENUES_TO_KEEP.includes(venue.slug)
  );

  console.log(`❌ Venues to delete: ${venuesToDelete.length}\n`);

  if (venuesToDelete.length === 0) {
    console.log('✨ No venues to delete. Database is already clean!');
    return;
  }

  // Show what will be deleted
  console.log('📋 Venues that will be deleted:');
  venuesToDelete.forEach((venue, index) => {
    console.log(`   ${index + 1}. ${venue.name} (${venue.slug})`);
  });

  console.log('\n⚠️  This will also delete:');
  console.log('   - All venue inquiries');
  console.log('   - All broadcast logs');
  console.log('   - Images from Cloudinary');

  // Delete venues and related data
  console.log('\n🗑️  Starting deletion...\n');

  for (const venue of venuesToDelete) {
    console.log(`Deleting: ${venue.name} (${venue.slug})`);

    try {
      // Delete related inquiries
      const inquiriesDeleted = await prisma.venueInquiry.deleteMany({
        where: { venueId: venue.id }
      });
      console.log(`  ├─ Deleted ${inquiriesDeleted.count} inquiries`);

      // Delete related broadcast logs
      const broadcastLogsDeleted = await prisma.venueBroadcastLog.deleteMany({
        where: { venueId: venue.id }
      });
      console.log(`  ├─ Deleted ${broadcastLogsDeleted.count} broadcast logs`);

      // Delete the venue
      await prisma.venue.delete({
        where: { id: venue.id }
      });
      console.log(`  └─ ✅ Venue deleted\n`);

    } catch (error) {
      console.error(`  └─ ❌ Error deleting venue: ${error}\n`);
    }
  }

  // Verify final count
  const remainingVenues = await prisma.venue.findMany({
    select: { slug: true, name: true }
  });

  console.log(`\n✨ Cleanup complete!`);
  console.log(`📊 Remaining venues: ${remainingVenues.length}\n`);

  console.log('📋 Remaining venues:');
  remainingVenues.forEach((venue, index) => {
    console.log(`   ${index + 1}. ${venue.name} (${venue.slug})`);
  });

  // Check for any missing venues
  const missingSlugs = VENUES_TO_KEEP.filter(
    slug => !remainingVenues.some(v => v.slug === slug)
  );

  if (missingSlugs.length > 0) {
    console.log('\n⚠️  Warning: These venues were not found in database:');
    missingSlugs.forEach(slug => console.log(`   - ${slug}`));
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
