import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

/**
 * BULK VENUE SCRAPER FOR MEATSPACE.CZ
 *
 * This script processes venues in batches using WebFetch.
 * Since we have 1,129 URLs, we'll process them strategically:
 *
 * 1. First: Process all parent venues (542 URLs)
 * 2. Then: Process sub-locations (587 URLs)
 *
 * Usage:
 * - The user will need to manually scrape batches using WebFetch
 * - Then use the batch-scrape-venues.ts script to import the data
 *
 * This script prepares batches of URLs for manual processing.
 */

interface UrlBatch {
  batchNumber: number;
  urls: string[];
  type: 'parent' | 'sublocation';
}

function extractSlug(url: string): { fullSlug: string; parentSlug?: string; isSubLocation: boolean } {
  const match = url.match(/\/prostory\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return { fullSlug: '', isSubLocation: false };

  const parentSlug = match[1];
  const subLocationSlug = match[2];

  if (subLocationSlug) {
    return {
      fullSlug: `${parentSlug}_${subLocationSlug}`,
      parentSlug: parentSlug,
      isSubLocation: true
    };
  }

  return {
    fullSlug: parentSlug,
    isSubLocation: false
  };
}

function parseUrls(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));
}

async function main() {
  const urlsFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const urls = parseUrls(urlsFile);

  console.log('🚀 Bulk Venue Scraper - Batch Preparation\n');
  console.log('=' .repeat(60) + '\n');

  // Separate parent and sub-location URLs
  const parentUrls: string[] = [];
  const subLocationUrls: string[] = [];

  for (const url of urls) {
    const { isSubLocation } = extractSlug(url);
    if (isSubLocation) {
      subLocationUrls.push(url);
    } else {
      parentUrls.push(url);
    }
  }

  console.log(`📊 URL Analysis:`);
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   Parent venues: ${parentUrls.length}`);
  console.log(`   Sub-locations: ${subLocationUrls.length}\n`);

  // Check existing venues
  const existingVenues = await prisma.venue.findMany({
    select: { slug: true }
  });

  const existingSlugs = new Set(existingVenues.map(v => v.slug));

  // Filter out already processed URLs
  const newParentUrls = parentUrls.filter(url => {
    const { fullSlug } = extractSlug(url);
    return !existingSlugs.has(fullSlug);
  });

  const newSubLocationUrls = subLocationUrls.filter(url => {
    const { fullSlug } = extractSlug(url);
    return !existingSlugs.has(fullSlug);
  });

  console.log(`📋 Remaining to Process:`);
  console.log(`   New parent venues: ${newParentUrls.length}`);
  console.log(`   New sub-locations: ${newSubLocationUrls.length}`);
  console.log(`   Already in database: ${parentUrls.length - newParentUrls.length + subLocationUrls.length - newSubLocationUrls.length}\n`);

  // Create batches (20 URLs per batch for manageable processing)
  const BATCH_SIZE = 20;
  const parentBatches: UrlBatch[] = [];

  for (let i = 0; i < newParentUrls.length; i += BATCH_SIZE) {
    parentBatches.push({
      batchNumber: Math.floor(i / BATCH_SIZE) + 1,
      urls: newParentUrls.slice(i, i + BATCH_SIZE),
      type: 'parent'
    });
  }

  console.log(`📦 Batches Created:`);
  console.log(`   Total parent batches: ${parentBatches.length} (${BATCH_SIZE} URLs each)\n`);

  // Save batches to files for easy processing
  const batchDir = './data/batches';
  if (!fs.existsSync(batchDir)) {
    fs.mkdirSync(batchDir, { recursive: true });
  }

  console.log(`💾 Saving batch files to ${batchDir}/\n`);

  parentBatches.forEach(batch => {
    const filename = `${batchDir}/batch-${String(batch.batchNumber).padStart(3, '0')}-parent.txt`;
    fs.writeFileSync(filename, batch.urls.join('\n'));
    console.log(`   ✅ Saved: ${filename} (${batch.urls.length} URLs)`);
  });

  console.log('\n📝 Next Steps:\n');
  console.log('1. Process each batch file using WebFetch or your preferred scraping method');
  console.log('2. Create JSON files with scraped data (see SCRAPING_GUIDE.md)');
  console.log('3. Run: npx tsx scripts/batch-scrape-venues.ts --batch=N');
  console.log('4. Repeat for all batches\n');

  console.log('💡 Pro Tip:');
  console.log('   Start with batch-001 and verify the data looks good before');
  console.log('   processing all batches. This ensures quality control.\n');

  // Save first batch for immediate testing
  if (parentBatches.length > 0) {
    const firstBatch = parentBatches[0];
    console.log('🎯 First Batch Preview (for testing):\n');
    firstBatch.urls.slice(0, 5).forEach((url, i) => {
      const { fullSlug } = extractSlug(url);
      console.log(`   ${i + 1}. ${fullSlug}`);
      console.log(`      ${url}`);
    });
    console.log(`   ... and ${firstBatch.urls.length - 5} more URLs\n`);
  }

  console.log('✨ Batch preparation complete!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
