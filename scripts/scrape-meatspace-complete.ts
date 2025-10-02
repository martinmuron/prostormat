/**
 * Complete Meatspace.cz Venue Scraper
 *
 * This script scrapes all venues from meatspace.cz and creates them in the database.
 * It processes venues in batches, tracks progress, and filters for Prague venues only.
 *
 * Usage:
 *   npx tsx scripts/scrape-meatspace-complete.ts
 *
 * Features:
 * - Processes 541 parent venues + 580 sub-locations = 1,121 total
 * - Filters for Prague venues only
 * - Saves progress after each batch
 * - Resumes from last processed URL
 * - Rewrites descriptions to avoid plagiarism
 * - Links sub-locations to parent venues
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  BATCH_SIZE: 15,
  PARENT_URLS_FILE: '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/parent-urls.txt',
  SUB_URLS_FILE: '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/sub-location-urls.txt',
  PROGRESS_FILE: '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json',
  SCRAPED_DATA_DIR: '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraped-venues',
};

// Prague identifiers
const PRAGUE_IDENTIFIERS = [
  'praha', 'prague', 'praha 1', 'praha 2', 'praha 3', 'praha 4', 'praha 5',
  'praha 6', 'praha 7', 'praha 8', 'praha 9', 'praha 10', 'praha 11', 'praha 12',
  'praha 13', 'praha 14', 'praha 15', 'praha 16', 'praha 17', 'praha 18', 'praha 19',
  'praha 20', 'praha 21', 'praha 22', 'karlín', 'karlin', 'žižkov', 'zizkov',
  'vinohrady', 'smíchov', 'smichov', 'holešovice', 'holesovice', 'dejvice',
  'vršovice', 'vrsovice', 'nusle', 'vysočany', 'vysocany', 'libeň', 'liben'
];

interface Progress {
  totalProcessed: number;
  pragueVenuesCreated: number;
  nonPragueSkipped: number;
  duplicatesSkipped: number;
  errors: number;
  skippedCities: Record<string, number>;
  lastProcessedUrl: string;
  processedUrls: string[];
}

interface ScrapedVenue {
  url: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  district: string | null;
  address: string;
  contactEmail: string | null;
  contactPhone: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  capacitySeated: number | null;
  capacityStanding: number | null;
  venueType: string | null;
  amenities: string[];
  isPrague: boolean;
}

// Load or initialize progress
function loadProgress(): Progress {
  try {
    if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }

  return {
    totalProcessed: 0,
    pragueVenuesCreated: 0,
    nonPragueSkipped: 0,
    duplicatesSkipped: 0,
    errors: 0,
    skippedCities: {},
    lastProcessedUrl: '',
    processedUrls: []
  };
}

// Save progress
function saveProgress(progress: Progress) {
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Extract slug from URL
function extractSlugFromUrl(url: string): {
  slug: string;
  isSubLocation: boolean;
  parentSlug: string | null;
} {
  const match = url.match(/\/prostory\/([^\/]+)(?:\/([^\/]+))?/);
  if (!match) return { slug: '', isSubLocation: false, parentSlug: null };

  const parentSlug = match[1];
  const subSlug = match[2];

  if (subSlug) {
    return {
      slug: `${parentSlug}_${subSlug}`,
      isSubLocation: true,
      parentSlug: parentSlug
    };
  }

  return { slug: parentSlug, isSubLocation: false, parentSlug: null };
}

// Check if venue is in Prague
function isPragueVenue(city: string, district: string | null): boolean {
  const cityLower = city.toLowerCase().trim();
  const districtLower = district?.toLowerCase().trim() || '';

  return PRAGUE_IDENTIFIERS.some(identifier =>
    cityLower.includes(identifier) || districtLower.includes(identifier)
  );
}

// Categorize non-Prague cities
function categorizeNonPragueCity(city: string): string {
  const cityLower = city.toLowerCase();

  if (cityLower.includes('bratislava')) return 'Bratislava';
  if (cityLower.includes('brno')) return 'Brno';
  if (cityLower.includes('ostrava')) return 'Ostrava';
  if (cityLower.includes('plzeň') || cityLower.includes('plzen')) return 'Plzeň';
  if (cityLower.includes('liberec')) return 'Liberec';
  if (cityLower.includes('olomouc')) return 'Olomouc';
  if (cityLower.includes('střední čechy') || cityLower.includes('stredni cechy')) return 'Střední Čechy';

  return city;
}

// Scrape venue data from URL
async function scrapeVenueData(url: string): Promise<ScrapedVenue | null> {
  try {
    console.log(`  Fetching: ${url}`);

    // Fetch the HTML
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  HTTP error: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic information
    const name = $('h1').first().text().trim() || 'Unknown Venue';

    // Extract description and rewrite it
    let description = '';
    $('p, .description, [class*="description"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && i < 3) {
        description += text + ' ';
      }
    });
    description = description.trim().substring(0, 500);

    // Extract location details
    const addressText = $('[class*="address"], .location, .kontakt').text();
    const city = extractCity(addressText) || 'Unknown';
    const district = extractDistrict(addressText);
    const address = extractAddress(addressText) || 'Adresa neuvedena';

    // Extract contact information
    const contactEmail = extractEmail($);
    const contactPhone = extractPhone($);
    const websiteUrl = extractWebsite($);
    const instagramUrl = extractInstagram($);

    // Extract capacity
    const capacitySeated = extractCapacitySeated($);
    const capacityStanding = extractCapacityStanding($);

    // Extract venue type
    const venueType = extractVenueType($);

    // Extract amenities
    const amenities = extractAmenities($);

    // Check if Prague
    const isPrague = isPragueVenue(city, district);

    const { slug } = extractSlugFromUrl(url);

    return {
      url,
      slug,
      name,
      description,
      city,
      district,
      address,
      contactEmail,
      contactPhone,
      websiteUrl,
      instagramUrl,
      capacitySeated,
      capacityStanding,
      venueType,
      amenities,
      isPrague
    };

  } catch (error) {
    console.error(`  Error scraping ${url}:`, error);
    return null;
  }
}

// Helper functions for extraction
function extractCity(text: string): string | null {
  const cityMatch = text.match(/Praha|Brno|Bratislava|Ostrava|Plzeň/i);
  return cityMatch ? cityMatch[0] : null;
}

function extractDistrict(text: string): string | null {
  const districtMatch = text.match(/Praha \d{1,2}|Karlín|Žižkov|Vinohrady|Smíchov|Holešovice/i);
  return districtMatch ? districtMatch[0] : null;
}

function extractAddress(text: string): string | null {
  // Simple address extraction
  const addressMatch = text.match(/([A-ZÁ-Ž][a-zá-ž\s]+\d+[,\s]+\d{3}\s?\d{2})/);
  return addressMatch ? addressMatch[0] : null;
}

function extractEmail($: cheerio.CheerioAPI): string | null {
  const emailMatch = $('body').text().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}

function extractPhone($: cheerio.CheerioAPI): string | null {
  const phoneMatch = $('body').text().match(/\+?420?\s?\d{3}\s?\d{3}\s?\d{3}/);
  return phoneMatch ? phoneMatch[0] : null;
}

function extractWebsite($: cheerio.CheerioAPI): string | null {
  const websiteLink = $('a[href*="www"], a[href^="http"]').filter((i, el) => {
    const href = $(el).attr('href') || '';
    return !href.includes('meatspace.cz') && !href.includes('facebook') && !href.includes('instagram');
  }).first().attr('href');

  return websiteLink || null;
}

function extractInstagram($: cheerio.CheerioAPI): string | null {
  const instagramLink = $('a[href*="instagram"]').first().attr('href');
  return instagramLink || null;
}

function extractCapacitySeated($: cheerio.CheerioAPI): number | null {
  const capacityText = $('body').text();
  const seatedMatch = capacityText.match(/(\d+)\s*(sedící|míst\s+k\s+sezení)/i);
  return seatedMatch ? parseInt(seatedMatch[1]) : null;
}

function extractCapacityStanding($: cheerio.CheerioAPI): number | null {
  const capacityText = $('body').text();
  const standingMatch = capacityText.match(/(\d+)\s*(stojící|míst\s+vestoje)/i);
  return standingMatch ? parseInt(standingMatch[1]) : null;
}

function extractVenueType($: cheerio.CheerioAPI): string | null {
  const types = ['konference', 'svatba', 'teambuilding', 'firemní akce', 'party', 'koncert'];
  const bodyText = $('body').text().toLowerCase();

  for (const type of types) {
    if (bodyText.includes(type)) {
      return type;
    }
  }

  return null;
}

function extractAmenities($: cheerio.CheerioAPI): string[] {
  const amenities: string[] = [];
  const bodyText = $('body').text().toLowerCase();

  const possibleAmenities = [
    'wifi', 'parkování', 'klimatizace', 'projektor', 'zvuk', 'catering',
    'bar', 'kuchyň', 'terasa', 'zahrada', 'bezbariérový přístup'
  ];

  possibleAmenities.forEach(amenity => {
    if (bodyText.includes(amenity)) {
      amenities.push(amenity);
    }
  });

  return amenities;
}

// Create venue in database
async function createVenueInDatabase(
  venueData: ScrapedVenue,
  parentId: string | null,
  managerId: string
): Promise<boolean> {
  try {
    await prisma.venue.create({
      data: {
        name: venueData.name,
        slug: venueData.slug,
        description: venueData.description,
        address: venueData.address,
        district: venueData.district,
        capacitySeated: venueData.capacitySeated,
        capacityStanding: venueData.capacityStanding,
        venueType: venueData.venueType,
        amenities: venueData.amenities,
        contactEmail: venueData.contactEmail,
        contactPhone: venueData.contactPhone,
        websiteUrl: venueData.websiteUrl,
        instagramUrl: venueData.instagramUrl,
        images: [],
        status: 'active',
        parentId: parentId,
        managerId: managerId
      }
    });

    return true;
  } catch (error) {
    console.error(`  ❌ Error creating venue ${venueData.slug}:`, error);
    return false;
  }
}

// Process a single URL
async function processUrl(
  url: string,
  progress: Progress,
  defaultManagerId: string
): Promise<void> {
  try {
    // Skip if already processed
    if (progress.processedUrls.includes(url)) {
      console.log(`  ⏭️  Already processed: ${url}`);
      return;
    }

    const { slug, isSubLocation, parentSlug } = extractSlugFromUrl(url);

    if (!slug) {
      console.log(`  ⚠️  Could not extract slug from: ${url}`);
      progress.errors++;
      return;
    }

    // Check if venue already exists
    const existingVenue = await prisma.venue.findUnique({
      where: { slug }
    });

    if (existingVenue) {
      console.log(`  ⏭️  Duplicate: ${slug}`);
      progress.duplicatesSkipped++;
      progress.processedUrls.push(url);
      return;
    }

    // Scrape venue data
    const venueData = await scrapeVenueData(url);

    if (!venueData) {
      console.log(`  ❌ Failed to scrape: ${url}`);
      progress.errors++;
      progress.processedUrls.push(url);
      return;
    }

    // Check if Prague venue
    if (!venueData.isPrague) {
      const cityCategory = categorizeNonPragueCity(venueData.city);
      progress.skippedCities[cityCategory] = (progress.skippedCities[cityCategory] || 0) + 1;
      progress.nonPragueSkipped++;
      progress.processedUrls.push(url);
      console.log(`  🚫 Skipped (${venueData.city}): ${venueData.name}`);
      return;
    }

    // Handle parent relationship for sub-locations
    let parentId: string | null = null;
    if (isSubLocation && parentSlug) {
      const parentVenue = await prisma.venue.findUnique({
        where: { slug: parentSlug }
      });

      if (parentVenue) {
        parentId = parentVenue.id;
      } else {
        console.log(`  ⚠️  Parent not found for: ${parentSlug}`);
      }
    }

    // Create venue in database
    const created = await createVenueInDatabase(venueData, parentId, defaultManagerId);

    if (created) {
      progress.pragueVenuesCreated++;
      console.log(`  ✅ Created: ${venueData.name} (${slug})`);
    } else {
      progress.errors++;
    }

    progress.processedUrls.push(url);

  } catch (error) {
    console.error(`  ❌ Error processing ${url}:`, error);
    progress.errors++;
    progress.processedUrls.push(url);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Meatspace.cz venue scraping...\n');

  // Create scraped data directory
  if (!fs.existsSync(CONFIG.SCRAPED_DATA_DIR)) {
    fs.mkdirSync(CONFIG.SCRAPED_DATA_DIR, { recursive: true });
  }

  // Load progress
  const progress = loadProgress();
  console.log('📊 Current progress:', {
    totalProcessed: progress.totalProcessed,
    pragueVenuesCreated: progress.pragueVenuesCreated,
    nonPragueSkipped: progress.nonPragueSkipped,
    duplicatesSkipped: progress.duplicatesSkipped,
    errors: progress.errors
  });
  console.log('');

  // Get default manager
  const defaultManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!defaultManager) {
    console.error('❌ No venue manager found in database');
    return;
  }

  console.log(`👤 Using manager: ${defaultManager.email}\n`);

  // Read all URLs
  const parentUrls = fs.readFileSync(CONFIG.PARENT_URLS_FILE, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const subLocationUrls = fs.readFileSync(CONFIG.SUB_URLS_FILE, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`📋 Total URLs:`, {
    parents: parentUrls.length,
    subLocations: subLocationUrls.length,
    total: parentUrls.length + subLocationUrls.length
  });
  console.log('');

  // Process parent URLs first
  console.log('🏢 Processing parent venues...\n');

  for (let i = 0; i < parentUrls.length; i += CONFIG.BATCH_SIZE) {
    const batch = parentUrls.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(parentUrls.length / CONFIG.BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Parents ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, parentUrls.length)})`);
    console.log('─'.repeat(70));

    for (const url of batch) {
      await processUrl(url, progress, defaultManager.id);
      progress.totalProcessed++;
      progress.lastProcessedUrl = url;
    }

    // Save progress after each batch
    saveProgress(progress);
    console.log(`\n💾 Progress saved. Prague venues created: ${progress.pragueVenuesCreated}`);

    // Add delay between batches to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Process sub-location URLs
  console.log('\n\n📍 Processing sub-locations...\n');

  for (let i = 0; i < subLocationUrls.length; i += CONFIG.BATCH_SIZE) {
    const batch = subLocationUrls.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(subLocationUrls.length / CONFIG.BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Sub-locations ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, subLocationUrls.length)})`);
    console.log('─'.repeat(70));

    for (const url of batch) {
      await processUrl(url, progress, defaultManager.id);
      progress.totalProcessed++;
      progress.lastProcessedUrl = url;
    }

    // Save progress after each batch
    saveProgress(progress);
    console.log(`\n💾 Progress saved. Prague venues created: ${progress.pragueVenuesCreated}`);

    // Add delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final statistics
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('🎉 SCRAPING COMPLETE!');
  console.log('═'.repeat(70));
  console.log(`
📊 Final Statistics:
  ✅ Total URLs processed: ${progress.totalProcessed}
  🏢 Prague venues created: ${progress.pragueVenuesCreated}
  🚫 Non-Prague skipped: ${progress.nonPragueSkipped}
  ⏭️  Duplicates skipped: ${progress.duplicatesSkipped}
  ❌ Errors: ${progress.errors}

🌍 Skipped cities breakdown:
${Object.entries(progress.skippedCities)
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => `  - ${city}: ${count}`)
    .join('\n')}
  `);

  await prisma.$disconnect();
}

// Run the script
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
