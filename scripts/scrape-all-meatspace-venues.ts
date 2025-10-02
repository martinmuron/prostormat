import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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

interface VenueData {
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
}

const PROGRESS_FILE = '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json';
const URLS_FILE = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
const BATCH_SIZE = 15;

// Prague identifiers for filtering
const PRAGUE_IDENTIFIERS = [
  'praha', 'prague', 'praha 1', 'praha 2', 'praha 3', 'praha 4', 'praha 5',
  'praha 6', 'praha 7', 'praha 8', 'praha 9', 'praha 10', 'praha 11', 'praha 12',
  'praha 13', 'praha 14', 'praha 15', 'praha 16', 'praha 17', 'praha 18', 'praha 19',
  'praha 20', 'praha 21', 'praha 22', 'karlín', 'karlin', 'žižkov', 'zizkov',
  'vinohrady', 'smíchov', 'smichov', 'holešovice', 'holesovice', 'dejvice',
  'vršovice', 'vrsovice', 'nusle', 'vysočany', 'vysocany', 'libeň', 'liben'
];

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
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

function saveProgress(progress: Progress) {
  try {
    const dir = path.dirname(PROGRESS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

function extractSlugFromUrl(url: string): { slug: string; isSubLocation: boolean; parentSlug: string | null } {
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

function isPragueVenue(city: string, district: string | null): boolean {
  const cityLower = city.toLowerCase().trim();
  const districtLower = district?.toLowerCase().trim() || '';

  return PRAGUE_IDENTIFIERS.some(identifier =>
    cityLower.includes(identifier) || districtLower.includes(identifier)
  );
}

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

async function fetchVenueDataFromUrl(url: string): Promise<VenueData | null> {
  // This is a placeholder - in actual implementation, you would use WebFetch
  // For now, we'll return mock data structure
  console.log(`  Fetching data from: ${url}`);

  // In real implementation, use WebFetch API here
  // const response = await webFetch(url, 'Extract venue details...');

  return null; // Will be replaced with actual WebFetch implementation
}

async function createVenue(
  venueData: VenueData,
  slug: string,
  parentId: string | null,
  managerId: string
): Promise<boolean> {
  try {
    await prisma.venue.create({
      data: {
        name: venueData.name,
        slug: slug,
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
    console.error(`  ❌ Error creating venue ${slug}:`, error);
    return false;
  }
}

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

    // Extract slug information
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

    // Fetch venue data (placeholder - needs WebFetch implementation)
    const venueData = await fetchVenueDataFromUrl(url);

    if (!venueData) {
      console.log(`  ❌ Failed to fetch data for: ${url}`);
      progress.errors++;
      progress.processedUrls.push(url);
      return;
    }

    // Check if Prague venue
    if (!isPragueVenue(venueData.city, venueData.district)) {
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
        console.log(`  ⚠️  Parent venue not found for sub-location: ${parentSlug}`);
      }
    }

    // Create venue
    const created = await createVenue(venueData, slug, parentId, defaultManagerId);

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

async function main() {
  console.log('🚀 Starting meatspace.cz venue scraping...\n');

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
  const allUrls = fs.readFileSync(URLS_FILE, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`📋 Total URLs to process: ${allUrls.length}\n`);

  // Separate parent and sub-location URLs
  const parentUrls: string[] = [];
  const subLocationUrls: string[] = [];

  allUrls.forEach(url => {
    const { isSubLocation } = extractSlugFromUrl(url);
    if (isSubLocation) {
      subLocationUrls.push(url);
    } else {
      parentUrls.push(url);
    }
  });

  console.log(`📁 Parent venues: ${parentUrls.length}`);
  console.log(`📂 Sub-locations: ${subLocationUrls.length}\n`);

  // Process parent URLs first
  console.log('🏢 Processing parent venues...\n');

  for (let i = 0; i < parentUrls.length; i += BATCH_SIZE) {
    const batch = parentUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(parentUrls.length / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Parent venues ${i + 1}-${Math.min(i + BATCH_SIZE, parentUrls.length)})`);
    console.log('─'.repeat(60));

    for (const url of batch) {
      await processUrl(url, progress, defaultManager.id);
      progress.totalProcessed++;
      progress.lastProcessedUrl = url;
    }

    // Save progress after each batch
    saveProgress(progress);
    console.log(`\n💾 Progress saved. Total created: ${progress.pragueVenuesCreated}`);
  }

  // Process sub-location URLs
  console.log('\n\n📍 Processing sub-locations...\n');

  for (let i = 0; i < subLocationUrls.length; i += BATCH_SIZE) {
    const batch = subLocationUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(subLocationUrls.length / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Sub-locations ${i + 1}-${Math.min(i + BATCH_SIZE, subLocationUrls.length)})`);
    console.log('─'.repeat(60));

    for (const url of batch) {
      await processUrl(url, progress, defaultManager.id);
      progress.totalProcessed++;
      progress.lastProcessedUrl = url;
    }

    // Save progress after each batch
    saveProgress(progress);
    console.log(`\n💾 Progress saved. Total created: ${progress.pragueVenuesCreated}`);
  }

  // Final statistics
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('🎉 SCRAPING COMPLETE!');
  console.log('═'.repeat(60));
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

main()
  .catch(console.error)
  .finally(() => process.exit(0));
