import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VenueData {
  url: string;
  slug: string;
  parentSlug?: string;
  isSubLocation: boolean;
  name: string;
  description: string;
  address: string;
  city: string;
  district?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  capacitySeated?: number;
  capacityStanding?: number;
  venueType?: string;
  amenities: string[];
  isPrague: boolean;
  skippedReason?: string;
}

interface ScrapingStats {
  totalProcessed: number;
  pragueParentsCreated: number;
  pragueSubsCreated: number;
  nonPragueSkipped: number;
  errors: number;
  skippedCities: Map<string, number>;
  errorMessages: string[];
}

// Extract slug from URL
function extractSlug(url: string): { fullSlug: string; parentSlug?: string; isSubLocation: boolean } {
  const match = url.match(/\/prostory\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return { fullSlug: '', isSubLocation: false };

  const parentSlug = match[1];
  const subLocationSlug = match[2];

  if (subLocationSlug) {
    // Sub-location: combine parent_sublocation
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

// Parse URLs from file
function parseUrls(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));
}

async function main() {
  console.log('🚀 Starting meatspace.cz venue scraper\n');
  console.log('=' .repeat(60) + '\n');

  const urlsFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const urls = parseUrls(urlsFile);

  console.log(`📋 Total URLs to process: ${urls.length}\n`);

  // Get or create default manager
  let defaultManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!defaultManager) {
    console.log('📝 Creating default venue manager...');
    defaultManager = await prisma.user.create({
      data: {
        email: 'manager@prostormat.cz',
        name: 'Default Manager',
        role: 'venue_manager',
      }
    });
    console.log(`   ✅ Created manager: ${defaultManager.email}\n`);
  }

  // First pass: identify and categorize all URLs
  console.log('🔍 Step 1: Analyzing URLs...\n');

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

  console.log(`   📍 Parent venues: ${parentUrls.length}`);
  console.log(`   📍 Sub-locations: ${subLocationUrls.length}\n`);

  console.log('⚠️  NOTE: This is a dry run showing first 10 URLs.');
  console.log('   Actual scraping will be implemented next.\n');

  // Show sample
  console.log('📋 Sample URLs:\n');
  console.log('Parent venues:');
  parentUrls.slice(0, 5).forEach((url, i) => {
    const { fullSlug } = extractSlug(url);
    console.log(`   ${i + 1}. ${fullSlug}`);
    console.log(`      ${url}\n`);
  });

  console.log('\nSub-locations:');
  subLocationUrls.slice(0, 5).forEach((url, i) => {
    const { fullSlug, parentSlug } = extractSlug(url);
    console.log(`   ${i + 1}. ${fullSlug} (parent: ${parentSlug})`);
    console.log(`      ${url}\n`);
  });

  console.log('\n✅ Analysis complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Implement WebFetch to scrape each URL');
  console.log('   2. Check if venue is in Prague (city/district)');
  console.log('   3. Rewrite descriptions using AI');
  console.log('   4. Create parent venues first');
  console.log('   5. Create sub-locations with parentId links');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
