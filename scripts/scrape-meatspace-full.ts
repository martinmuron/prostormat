#!/usr/bin/env ts-node

/**
 * Meatspace.cz Venue Scraper
 *
 * This script scrapes venue data from meatspace.cz and creates records in the database.
 * It processes URLs in two phases:
 * 1. Parent venues (URLs without sub-paths)
 * 2. Sub-locations (URLs with sub-paths), linked to parents via parentId
 *
 * Run in test mode: npx ts-node scripts/scrape-meatspace-full.ts --test
 * Run full scrape: npx ts-node scripts/scrape-meatspace-full.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Prague location identifiers
const PRAGUE_KEYWORDS = [
  'praha', 'prague',
  'praha 1', 'praha 2', 'praha 3', 'praha 4', 'praha 5', 'praha 6', 'praha 7', 'praha 8', 'praha 9', 'praha 10',
  'karlín', 'karlin', 'žižkov', 'zizkov', 'vinohrady', 'smíchov', 'smichov', 'holešovice', 'holesovice',
  'dejvice', 'nusle', 'vršovice', 'vrsovice', 'libeň', 'liben', 'malá strana', 'mala strana',
  'staré město', 'stare mesto', 'nové město', 'nove mesto', 'letňany', 'letnany'
];

interface Stats {
  totalProcessed: number;
  pragueParentsCreated: number;
  pragueSubsCreated: number;
  nonPragueSkipped: number;
  alreadyExists: number;
  errors: number;
  skippedCities: Map<string, number>;
  errorMessages: string[];
}

const stats: Stats = {
  totalProcessed: 0,
  pragueParentsCreated: 0,
  pragueSubsCreated: 0,
  nonPragueSkipped: 0,
  alreadyExists: 0,
  errors: 0,
  skippedCities: new Map(),
  errorMessages: []
};

// Extract slug components from URL
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

// Check if location is in Prague
function isPragueLocation(text: string): boolean {
  const normalized = text.toLowerCase();
  return PRAGUE_KEYWORDS.some(keyword => normalized.includes(keyword));
}

// Simulate scraping a page (placeholder for actual WebFetch implementation)
async function scrapePage(url: string): Promise<any> {
  // TODO: Implement actual WebFetch scraping
  // For now, this is a placeholder that would extract:
  // - name, description, address, city, district
  // - contact email, phone, website, instagram
  // - capacity, venue type, amenities
  // - images

  console.log(`   [Scraping] ${url}`);

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data structure
  return {
    name: 'Scraped Venue Name',
    description: 'Scraped description that will be rewritten',
    address: 'Street Address 123',
    city: 'Praha',
    district: 'Praha 1',
    postalCode: '110 00',
    contactEmail: 'contact@venue.cz',
    contactPhone: '+420 123 456 789',
    websiteUrl: 'https://venue.cz',
    instagramUrl: 'https://instagram.com/venue',
    capacitySeated: 50,
    capacityStanding: 100,
    venueType: 'Konferenční místnost',
    amenities: ['Wi-Fi', 'Projektor', 'Klimatizace'],
    images: []
  };
}

// Rewrite description to avoid plagiarism
function rewriteDescription(original: string): string {
  // TODO: Implement AI-based rewriting or manual rewriting logic
  // For now, return a modified version
  return `${original} (rewritten version)`;
}

// Create venue in database
async function createVenue(
  scrapedData: any,
  slug: string,
  managerId: string,
  parentId?: string
): Promise<boolean> {
  try {
    // Check if already exists
    const existing = await prisma.venue.findUnique({
      where: { slug }
    });

    if (existing) {
      console.log(`   ⏭️  Already exists: ${slug}`);
      stats.alreadyExists++;
      return false;
    }

    // Rewrite description
    const description = scrapedData.description
      ? rewriteDescription(scrapedData.description)
      : '';

    // Create venue
    await prisma.venue.create({
      data: {
        slug,
        name: scrapedData.name,
        description,
        address: scrapedData.address,
        district: scrapedData.district,
        contactEmail: scrapedData.contactEmail,
        contactPhone: scrapedData.contactPhone,
        websiteUrl: scrapedData.websiteUrl,
        instagramUrl: scrapedData.instagramUrl,
        capacitySeated: scrapedData.capacitySeated,
        capacityStanding: scrapedData.capacityStanding,
        venueType: scrapedData.venueType,
        amenities: scrapedData.amenities || [],
        images: scrapedData.images || [],
        managerId,
        parentId,
        status: 'active'
      }
    });

    if (parentId) {
      stats.pragueSubsCreated++;
      console.log(`   ✅ Created sub-location: ${scrapedData.name}`);
    } else {
      stats.pragueParentsCreated++;
      console.log(`   ✅ Created parent: ${scrapedData.name}`);
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error creating ${slug}:`, error);
    stats.errors++;
    stats.errorMessages.push(`${slug}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Process a single URL
async function processUrl(
  url: string,
  managerId: string,
  parentVenueMap: Map<string, string>
): Promise<void> {
  stats.totalProcessed++;

  const { fullSlug, parentSlug, isSubLocation } = extractSlug(url);

  console.log(`\n[${stats.totalProcessed}] Processing: ${fullSlug}`);

  try {
    // Scrape the page
    const scrapedData = await scrapePage(url);

    // Check if Prague location
    const locationText = `${scrapedData.city} ${scrapedData.district || ''}`;
    if (!isPragueLocation(locationText)) {
      console.log(`   ⏭️  Skipping non-Prague: ${scrapedData.city}`);
      stats.nonPragueSkipped++;
      const count = stats.skippedCities.get(scrapedData.city) || 0;
      stats.skippedCities.set(scrapedData.city, count + 1);
      return;
    }

    // For sub-locations, find parent ID
    let parentId: string | undefined;
    if (isSubLocation && parentSlug) {
      parentId = parentVenueMap.get(parentSlug);
      if (!parentId) {
        console.log(`   ⚠️  Parent not found: ${parentSlug}`);
        stats.errors++;
        return;
      }
    }

    // Create venue
    await createVenue(scrapedData, fullSlug, managerId, parentId);

    // If this is a parent, store its ID
    if (!isSubLocation) {
      const venue = await prisma.venue.findUnique({
        where: { slug: fullSlug },
        select: { id: true }
      });
      if (venue) {
        parentVenueMap.set(fullSlug, venue.id);
      }
    }

  } catch (error) {
    console.error(`   ❌ Error processing ${url}:`, error);
    stats.errors++;
    stats.errorMessages.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Print final statistics
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('SCRAPING COMPLETE - STATISTICS');
  console.log('='.repeat(60));
  console.log(`Total URLs processed:       ${stats.totalProcessed}`);
  console.log(`Prague parents created:     ${stats.pragueParentsCreated}`);
  console.log(`Prague sub-locations created: ${stats.pragueSubsCreated}`);
  console.log(`Already exists (skipped):   ${stats.alreadyExists}`);
  console.log(`Non-Prague skipped:         ${stats.nonPragueSkipped}`);
  console.log(`Errors:                     ${stats.errors}`);

  if (stats.skippedCities.size > 0) {
    console.log('\nSkipped cities:');
    for (const [city, count] of stats.skippedCities.entries()) {
      console.log(`  - ${city}: ${count}`);
    }
  }

  if (stats.errorMessages.length > 0 && stats.errorMessages.length <= 10) {
    console.log('\nError messages:');
    stats.errorMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg}`);
    });
  } else if (stats.errorMessages.length > 10) {
    console.log(`\nError messages: ${stats.errorMessages.length} errors (showing first 10)`);
    stats.errorMessages.slice(0, 10).forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg}`);
    });
  }
}

async function main() {
  console.log('🚀 Meatspace.cz Venue Scraper');
  console.log('='.repeat(60));

  // Check for test mode
  const testMode = process.argv.includes('--test');
  const testLimit = 10;

  if (testMode) {
    console.log(`⚠️  TEST MODE: Processing first ${testLimit} URLs only\n`);
  }

  // Get venue manager
  let manager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!manager) {
    console.log('Creating default venue manager...');
    manager = await prisma.user.create({
      data: {
        email: 'manager@prostormat.cz',
        name: 'Default Manager',
        role: 'venue_manager'
      }
    });
  }

  console.log(`Using manager: ${manager.email} (${manager.id})\n`);

  // Read URLs
  const urlsFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const content = fs.readFileSync(urlsFile, 'utf-8');
  const allUrls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));

  console.log(`📋 Total URLs in file: ${allUrls.length}\n`);

  // Separate parent and sub-location URLs
  const parentUrls: string[] = [];
  const subLocationUrls: string[] = [];

  for (const url of allUrls) {
    const { isSubLocation } = extractSlug(url);
    if (isSubLocation) {
      subLocationUrls.push(url);
    } else {
      parentUrls.push(url);
    }
  }

  console.log(`📍 Parent venues: ${parentUrls.length}`);
  console.log(`📍 Sub-locations: ${subLocationUrls.length}\n`);

  // Map to store parent slug -> parent ID
  const parentVenueMap = new Map<string, string>();

  // Phase 1: Process parent venues
  console.log('=' .repeat(60));
  console.log('PHASE 1: Processing Parent Venues');
  console.log('='.repeat(60));

  const urlsToProcess = testMode ? parentUrls.slice(0, testLimit) : parentUrls;

  for (const url of urlsToProcess) {
    await processUrl(url, manager.id, parentVenueMap);
  }

  // Phase 2: Process sub-locations (only if not in test mode)
  if (!testMode) {
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 2: Processing Sub-Locations');
    console.log('='.repeat(60));

    for (const url of subLocationUrls) {
      await processUrl(url, manager.id, parentVenueMap);
    }
  }

  // Print statistics
  printStats();

  // Get final count
  const totalVenues = await prisma.venue.count();
  console.log(`\n📊 Total venues in database: ${totalVenues}`);
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
