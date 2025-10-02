import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface ScrapedVenue {
  url: string;
  slug: string;
  parentSlug?: string;
  name: string;
  description: string;
  city: string;
  district?: string;
  address: string;
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
  isSubLocation: boolean;
}

interface ProcessingStats {
  totalProcessed: number;
  pragueVenuesCreated: number;
  nonPragueSkipped: number;
  duplicatesSkipped: number;
  errors: number;
  skippedCities: Map<string, number>;
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

function isPragueLocation(city: string, district?: string): boolean {
  if (!city) return false;

  const cityLower = city.toLowerCase();
  const districtLower = district?.toLowerCase() || '';

  // Prague identifiers
  const pragueKeywords = [
    'prague',
    'praha',
    'karlín',
    'karlin',
    'žižkov',
    'zizkov',
    'vinohrady',
    'vršovice',
    'vrsovice',
    'holešovice',
    'holesovice',
    'smíchov',
    'smichov',
    'nusle',
    'michle',
    'pankrác',
    'pankrac',
    'dejvice',
    'letná',
    'letna',
    'libeň',
    'liben',
    'vysočany',
    'vysocany',
    'prosek',
    'stodůlky',
    'stodulky',
    'řepy',
    'repy',
    'modřany',
    'modrany',
    'braník',
    'branik'
  ];

  // Check if Prague is mentioned
  for (const keyword of pragueKeywords) {
    if (cityLower.includes(keyword) || districtLower.includes(keyword)) {
      return true;
    }
  }

  // Check Prague districts (Praha 1-22)
  if (/praha\s*\d{1,2}/i.test(cityLower) || /praha\s*\d{1,2}/i.test(districtLower)) {
    return true;
  }

  return false;
}

function parseUrls(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));
}

async function createVenueInDatabase(venue: ScrapedVenue, managerId: string): Promise<boolean> {
  try {
    // Check if venue already exists
    const existing = await prisma.venue.findUnique({
      where: { slug: venue.slug }
    });

    if (existing) {
      console.log(`   ⏭️  Skipped (already exists): ${venue.name}`);
      return false;
    }

    // For sub-locations, find parent
    let parentId: string | undefined;
    if (venue.isSubLocation && venue.parentSlug) {
      const parent = await prisma.venue.findUnique({
        where: { slug: venue.parentSlug }
      });

      if (parent) {
        parentId = parent.id;
      } else {
        console.log(`   ⚠️  Warning: Parent not found for ${venue.slug}, will create as standalone`);
      }
    }

    // Create venue
    await prisma.venue.create({
      data: {
        name: venue.name,
        slug: venue.slug,
        description: venue.description || '',
        address: venue.address || '',
        district: venue.district || '',
        contactEmail: venue.contactEmail || '',
        contactPhone: venue.contactPhone || '',
        websiteUrl: venue.websiteUrl || '',
        instagramUrl: venue.instagramUrl || '',
        capacitySeated: venue.capacitySeated || null,
        capacityStanding: venue.capacityStanding || null,
        venueType: venue.venueType || '',
        amenities: venue.amenities || [],
        images: [],
        managerId: managerId,
        parentId: parentId,
        status: 'active',
      }
    });

    console.log(`   ✅ Created: ${venue.name} (${venue.slug})`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error creating ${venue.slug}:`, error);
    return false;
  }
}

// Save progress periodically
function saveProgress(stats: ProcessingStats, processedUrls: string[]) {
  const progressData = {
    timestamp: new Date().toISOString(),
    stats: {
      totalProcessed: stats.totalProcessed,
      pragueVenuesCreated: stats.pragueVenuesCreated,
      nonPragueSkipped: stats.nonPragueSkipped,
      duplicatesSkipped: stats.duplicatesSkipped,
      errors: stats.errors,
    },
    processedUrls: processedUrls,
  };

  fs.writeFileSync(
    './data/scraping-progress.json',
    JSON.stringify(progressData, null, 2)
  );
}

async function main() {
  console.log('🚀 Automated Venue Scraper - Full Processing\n');
  console.log('=' .repeat(60) + '\n');

  const urlsFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const urls = parseUrls(urlsFile);

  console.log(`📋 Total URLs to process: ${urls.length}\n`);

  // Get or create default manager
  let defaultManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!defaultManager) {
    defaultManager = await prisma.user.create({
      data: {
        email: 'manager@prostormat.cz',
        name: 'Default Manager',
        role: 'venue_manager',
      }
    });
  }

  console.log(`✅ Using manager: ${defaultManager.email}\n`);

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

  console.log(`📊 URL Breakdown:`);
  console.log(`   Parent venues: ${parentUrls.length}`);
  console.log(`   Sub-locations: ${subLocationUrls.length}\n`);

  const stats: ProcessingStats = {
    totalProcessed: 0,
    pragueVenuesCreated: 0,
    nonPragueSkipped: 0,
    duplicatesSkipped: 0,
    errors: 0,
    skippedCities: new Map(),
  };

  const processedUrls: string[] = [];

  console.log('🔄 Processing parent venues first...\n');
  console.log('⚠️  NOTE: Due to WebFetch limitations, this script shows the');
  console.log('   processing logic. Actual scraping requires manual WebFetch calls.\n');
  console.log('   Please use the batch processing approach with the agent.\n');

  // This is a framework - actual WebFetch calls need to be done by the Task agent
  console.log('✨ Automated scraper framework ready!\n');
  console.log('📝 Next steps:');
  console.log('   1. Use Task agent to scrape venues in batches');
  console.log('   2. Process using batch-scrape-venues.ts');
  console.log('   3. Monitor progress with check-scraping-progress.ts\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
