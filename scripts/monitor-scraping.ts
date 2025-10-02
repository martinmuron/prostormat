import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.clear();
  console.log('🔍 Venue Scraping Progress Monitor\n');
  console.log('=' .repeat(60) + '\n');

  // Read progress file
  const progressFile = './data/scraping-progress.json';
  let progress: any = { totalProcessed: 0, pragueVenuesCreated: 0 };

  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
  }

  // Get database stats
  const totalVenues = await prisma.venue.count();
  const parentVenues = await prisma.venue.count({
    where: { parentId: null }
  });
  const subLocations = await prisma.venue.count({
    where: { parentId: { not: null } }
  });

  // Calculate progress
  const totalUrls = 1129;
  const parentUrls = 542;
  const progressPercent = ((progress.totalProcessed / totalUrls) * 100).toFixed(1);
  const parentProgressPercent = ((progress.totalProcessed / parentUrls) * 100).toFixed(1);

  console.log('📊 Overall Progress:');
  console.log(`   URLs Processed: ${progress.totalProcessed} / ${totalUrls} (${progressPercent}%)`);
  console.log(`   Parent Venues: ${progress.totalProcessed} / ${parentUrls} (${parentProgressPercent}%)`);
  console.log('');

  console.log('✅ Database Statistics:');
  console.log(`   Total Venues: ${totalVenues}`);
  console.log(`   Parent Venues: ${parentVenues}`);
  console.log(`   Sub-locations: ${subLocations}`);
  console.log('');

  console.log('📈 Scraping Results:');
  console.log(`   Prague Venues Created: ${progress.pragueVenuesCreated}`);
  console.log(`   Non-Prague Skipped: ${progress.nonPragueSkipped}`);
  console.log(`   Duplicates Skipped: ${progress.duplicatesSkipped}`);
  console.log(`   Errors: ${progress.errors}`);
  console.log('');

  if (progress.skippedCities) {
    console.log('🚫 Skipped by City:');
    Object.entries(progress.skippedCities).forEach(([city, count]) => {
      console.log(`   ${city}: ${count}`);
    });
    console.log('');
  }

  if (progress.lastProcessedUrl) {
    console.log('🔗 Last Processed:');
    console.log(`   ${progress.lastProcessedUrl}`);
    console.log('');
  }

  // Estimate completion
  if (progress.totalProcessed > 0) {
    const remainingUrls = parentUrls - progress.totalProcessed;
    const avgTimePerUrl = 3; // seconds estimate
    const estimatedMinutes = (remainingUrls * avgTimePerUrl) / 60;

    console.log('⏱️  Estimated Time Remaining:');
    console.log(`   ~${Math.ceil(estimatedMinutes)} minutes for parent venues`);
    console.log('');
  }

  console.log('💡 Commands:');
  console.log('   npx tsx scripts/monitor-scraping.ts  - Refresh this view');
  console.log('   tail -f logs/scraping.log            - View live logs');
  console.log('');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
