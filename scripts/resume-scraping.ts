/**
 * Resume Meatspace.cz Venue Scraping
 *
 * This script resumes scraping from where it left off, processing all remaining venues.
 * It reads from the single prague_urls.txt file and uses the progress tracking system.
 *
 * Usage:
 *   npx tsx scripts/resume-scraping.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  BATCH_SIZE: 15,
  URLS_FILE: '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt',
  PROGRESS_FILE: '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json',
  DELAY_BETWEEN_REQUESTS: 1500, // ms
  DELAY_BETWEEN_BATCHES: 2000, // ms
};

// Prague identifiers
const PRAGUE_IDENTIFIERS = [
  'praha', 'prague', 'praha 1', 'praha 2', 'praha 3', 'praha 4', 'praha 5',
  'praha 6', 'praha 7', 'praha 8', 'praha 9', 'praha 10', 'praha 11', 'praha 12',
  'praha 13', 'praha 14', 'praha 15', 'praha 16', 'praha 17', 'praha 18', 'praha 19',
  'praha 20', 'praha 21', 'praha 22', 'karlín', 'karlin', 'žižkov', 'zizkov',
  'vinohrady', 'smíchov', 'smichov', 'holešovice', 'holesovice', 'dejvice',
  'vršovice', 'vrsovice', 'nusle', 'vysočany', 'vysocany', 'libeň', 'liben',
  'střížkov', 'strizkov', 'prosek', 'ládví', 'ladvi', 'letňany', 'letnany'
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
  console.log(`💾 Progress saved (${progress.pragueVenuesCreated} Prague venues created)`);
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
function isPragueVenue(city: string, district: string | null, address: string): boolean {
  const cityLower = city.toLowerCase().trim();
  const districtLower = district?.toLowerCase().trim() || '';
  const addressLower = address.toLowerCase().trim();

  return PRAGUE_IDENTIFIERS.some(identifier =>
    cityLower.includes(identifier) ||
    districtLower.includes(identifier) ||
    addressLower.includes(identifier)
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
  if (cityLower.includes('karlovy vary')) return 'Karlovy Vary';
  if (cityLower.includes('mladá boleslav') || cityLower.includes('mlada boleslav')) return 'Mladá Boleslav';
  if (cityLower.includes('revnice')) return 'Revnice';
  if (cityLower.includes('střední čechy') || cityLower.includes('stredni cechy')) return 'Střední Čechy';

  return city || 'Unknown';
}

// Rewrite description to avoid plagiarism
function rewriteDescription(original: string, name: string): string {
  if (!original || original.length < 20) {
    return `${name} nabízí kvalitní prostory pro nejrůznější typy akcí v Praze. Ideální volba pro vaši příští událost.`;
  }

  // Take key points but rewrite them
  const sentences = original.split(/[.!?]+/).filter(s => s.trim().length > 20);

  const intros = [
    `Prostor ${name} představuje`,
    `${name} nabízí`,
    `V ${name} naleznete`,
    `${name} je moderní prostor, který poskytuje`,
    `Venue ${name} disponuje`,
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];

  // Take first meaningful sentence and rephrase
  let content = '';
  if (sentences.length > 0) {
    content = sentences[0].trim().toLowerCase();
    // Remove first few words if they're the venue name (escape special regex characters)
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
    content = content.replace(new RegExp(escapedName, 'gi'), 'tento prostor');
  }

  const result = `${intro} ${content}.`.substring(0, 500);
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Scrape venue data from URL
async function scrapeVenueData(url: string): Promise<ScrapedVenue | null> {
  try {
    console.log(`    🔍 Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`    ❌ HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract name
    let name = $('h1').first().text().trim();
    if (!name) {
      name = $('title').text().split('|')[0].trim();
    }
    if (!name) {
      name = 'Unknown Venue';
    }

    // Extract description
    let description = '';
    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc) {
      description = metaDesc;
    } else {
      $('.description, .about, .info, p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 50 && !description) {
          description = text;
        }
      });
    }

    // Extract location
    let city = '';
    let district = '';
    let address = '';

    // Try to find address in various places
    const addressSelectors = [
      '.address', '.location', '.venue-address', '[itemprop="address"]',
      '.contact-info', '.info-item'
    ];

    for (const selector of addressSelectors) {
      const addressText = $(selector).text();
      if (addressText && addressText.length > 5) {
        address = addressText.trim();
        break;
      }
    }

    // If no address found, search in body text
    if (!address) {
      const bodyText = $('body').text();
      const addressMatch = bodyText.match(/([A-ZÁ-Ž][a-zá-ž\s]+\d+[,\s]+\d{3}\s?\d{2}\s+Praha)/i);
      if (addressMatch) {
        address = addressMatch[0].trim();
      }
    }

    // Extract city and district from address
    if (address.toLowerCase().includes('praha')) {
      city = 'Praha';
      const districtMatch = address.match(/Praha\s+(\d{1,2})/i);
      if (districtMatch) {
        district = `Praha ${districtMatch[1]}`;
      }
    } else if (address.toLowerCase().includes('brno')) {
      city = 'Brno';
    } else if (address.toLowerCase().includes('bratislava')) {
      city = 'Bratislava';
    }

    // Extract contact info
    const bodyText = $('body').text();
    const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const contactEmail = emailMatch ? emailMatch[0] : null;

    const phoneMatch = bodyText.match(/\+?420?\s?\d{3}\s?\d{3}\s?\d{3}/);
    const contactPhone = phoneMatch ? phoneMatch[0] : null;

    // Extract website
    let websiteUrl = null;
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.match(/^https?:\/\//) &&
          !href.includes('meatspace.cz') &&
          !href.includes('facebook') &&
          !href.includes('instagram') &&
          !href.includes('linkedin')) {
        websiteUrl = href;
        return false; // break
      }
    });

    // Extract Instagram
    const instagramUrl = $('a[href*="instagram"]').first().attr('href') || null;

    // Rewrite description AFTER we have all the data
    description = rewriteDescription(description, name);

    // Extract capacity
    let capacitySeated = null;
    let capacityStanding = null;

    const seatedMatch = bodyText.match(/(\d+)\s*(sedících|míst\s+k\s+sezení|seated)/i);
    if (seatedMatch) capacitySeated = parseInt(seatedMatch[1]);

    const standingMatch = bodyText.match(/(\d+)\s*(stojících|míst\s+vestoje|standing)/i);
    if (standingMatch) capacityStanding = parseInt(standingMatch[1]);

    // If no specific seated/standing, try general capacity
    if (!capacitySeated && !capacityStanding) {
      const capacityMatch = bodyText.match(/kapacita[:\s]+(\d+)/i) ||
                           bodyText.match(/(\d+)\s*(osob|people|guests)/i);
      if (capacityMatch) {
        const cap = parseInt(capacityMatch[1]);
        if (cap > 0 && cap < 10000) {
          capacityStanding = cap;
        }
      }
    }

    // Extract venue type
    let venueType = null;
    const types = ['konference', 'svatba', 'teambuilding', 'oslava', 'party', 'koncert', 'firemní akce'];
    for (const type of types) {
      if (bodyText.toLowerCase().includes(type)) {
        venueType = type;
        break;
      }
    }

    // Extract amenities
    const amenities: string[] = [];
    const possibleAmenities = [
      'wifi', 'parkování', 'klimatizace', 'projektor', 'zvuk', 'catering',
      'bar', 'kuchyň', 'terasa', 'zahrada', 'bezbariérový'
    ];

    possibleAmenities.forEach(amenity => {
      if (bodyText.toLowerCase().includes(amenity)) {
        amenities.push(amenity);
      }
    });

    // Check if Prague
    const isPrague = isPragueVenue(city, district, address);

    const { slug } = extractSlugFromUrl(url);

    return {
      url,
      slug,
      name,
      description,
      city,
      district,
      address: address || 'Adresa neuvedena',
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
    console.error(`    ❌ Error scraping:`, error);
    return null;
  }
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
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error(`    ⚠️  Duplicate slug: ${venueData.slug}`);
    } else {
      console.error(`    ❌ Database error:`, error.message);
    }
    return false;
  }
}

// Process a single URL
async function processUrl(
  url: string,
  progress: Progress,
  defaultManagerId: string
): Promise<void> {
  const { slug, isSubLocation, parentSlug } = extractSlugFromUrl(url);

  if (!slug) {
    console.log(`  ⚠️  Invalid URL: ${url}`);
    progress.errors++;
    return;
  }

  console.log(`  [${progress.totalProcessed + 1}] ${slug}`);

  try {
    // Check if venue already exists in database
    const existingVenue = await prisma.venue.findUnique({
      where: { slug }
    });

    if (existingVenue) {
      console.log(`    ⏭️  Already exists in DB`);
      progress.duplicatesSkipped++;
      return;
    }

    // Scrape venue data
    const venueData = await scrapeVenueData(url);

    if (!venueData) {
      console.log(`    ❌ Scraping failed`);
      progress.errors++;
      return;
    }

    // Check if Prague venue
    if (!venueData.isPrague) {
      const cityCategory = categorizeNonPragueCity(venueData.city);
      progress.skippedCities[cityCategory] = (progress.skippedCities[cityCategory] || 0) + 1;
      progress.nonPragueSkipped++;
      console.log(`    🚫 Not Prague (${cityCategory})`);
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
        console.log(`    🔗 Linked to parent: ${parentSlug}`);
      } else {
        console.log(`    ⚠️  Parent not found: ${parentSlug}`);
      }
    }

    // Create venue in database
    const created = await createVenueInDatabase(venueData, parentId, defaultManagerId);

    if (created) {
      progress.pragueVenuesCreated++;
      console.log(`    ✅ Created: ${venueData.name}`);
    } else {
      progress.errors++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));

  } catch (error) {
    console.error(`    ❌ Error:`, error);
    progress.errors++;
  }
}

// Main function
async function main() {
  console.log('🚀 Resuming Meatspace.cz venue scraping...\n');

  // Load progress
  const progress = loadProgress();
  console.log('📊 Current Progress:');
  console.log(`  ✅ Prague venues created: ${progress.pragueVenuesCreated}`);
  console.log(`  🚫 Non-Prague skipped: ${progress.nonPragueSkipped}`);
  console.log(`  ⏭️  Duplicates skipped: ${progress.duplicatesSkipped}`);
  console.log(`  ❌ Errors: ${progress.errors}`);
  console.log(`  📍 URLs processed: ${progress.processedUrls.length}`);
  console.log('');

  // Get default manager
  const defaultManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!defaultManager) {
    console.error('❌ No venue manager found in database');
    await prisma.$disconnect();
    return;
  }

  console.log(`👤 Manager: ${defaultManager.email}\n`);

  // Read all URLs from file
  const allUrls = fs.readFileSync(CONFIG.URLS_FILE, 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log(`📋 Total URLs in file: ${allUrls.length}`);

  // Filter out already processed URLs
  const remainingUrls = allUrls.filter(url => !progress.processedUrls.includes(url));

  console.log(`📋 Remaining URLs to process: ${remainingUrls.length}`);
  console.log('');

  if (remainingUrls.length === 0) {
    console.log('✨ All URLs already processed!');
    await prisma.$disconnect();
    return;
  }

  // Separate parent and sub-location URLs
  const remainingParentUrls = remainingUrls.filter(url => {
    const parts = url.split('/prostory/')[1]?.split('/');
    return parts && (parts.length === 1 || (parts.length === 2 && !parts[1]));
  });

  const remainingSubLocationUrls = remainingUrls.filter(url => {
    const parts = url.split('/prostory/')[1]?.split('/');
    return parts && parts.length > 1 && parts[1];
  });

  console.log(`🏢 Parent venues remaining: ${remainingParentUrls.length}`);
  console.log(`📍 Sub-locations remaining: ${remainingSubLocationUrls.length}`);
  console.log('');

  // Process parent venues first
  if (remainingParentUrls.length > 0) {
    console.log('═'.repeat(70));
    console.log('🏢 PROCESSING PARENT VENUES');
    console.log('═'.repeat(70));
    console.log('');

    for (let i = 0; i < remainingParentUrls.length; i += CONFIG.BATCH_SIZE) {
      const batch = remainingParentUrls.slice(i, i + CONFIG.BATCH_SIZE);
      const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(remainingParentUrls.length / CONFIG.BATCH_SIZE);

      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} URLs)`);
      console.log('─'.repeat(70));

      for (const url of batch) {
        await processUrl(url, progress, defaultManager.id);
        progress.totalProcessed++;
        progress.lastProcessedUrl = url;
        progress.processedUrls.push(url);

        // Save progress every 10 venues
        if (progress.totalProcessed % 10 === 0) {
          saveProgress(progress);
        }
      }

      // Save after each batch
      saveProgress(progress);
      console.log('');

      // Delay between batches
      if (i + CONFIG.BATCH_SIZE < remainingParentUrls.length) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }
  }

  // Process sub-locations
  if (remainingSubLocationUrls.length > 0) {
    console.log('═'.repeat(70));
    console.log('📍 PROCESSING SUB-LOCATIONS');
    console.log('═'.repeat(70));
    console.log('');

    for (let i = 0; i < remainingSubLocationUrls.length; i += CONFIG.BATCH_SIZE) {
      const batch = remainingSubLocationUrls.slice(i, i + CONFIG.BATCH_SIZE);
      const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(remainingSubLocationUrls.length / CONFIG.BATCH_SIZE);

      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} URLs)`);
      console.log('─'.repeat(70));

      for (const url of batch) {
        await processUrl(url, progress, defaultManager.id);
        progress.totalProcessed++;
        progress.lastProcessedUrl = url;
        progress.processedUrls.push(url);

        // Save progress every 10 venues
        if (progress.totalProcessed % 10 === 0) {
          saveProgress(progress);
        }
      }

      // Save after each batch
      saveProgress(progress);
      console.log('');

      // Delay between batches
      if (i + CONFIG.BATCH_SIZE < remainingSubLocationUrls.length) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }
  }

  // Final save
  saveProgress(progress);

  // Final statistics
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

🌍 Skipped Cities:
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
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
