import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ProgressData {
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
  slug: string;
  description: string;
  address: string;
  city: string;
  district: string;
  capacity: number;
  priceRange: string;
  venueTypes: string[];
  amenities: string[];
  images: string[];
  parentId?: string;
}

// Read URLs from file
const urlsPath = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
const progressPath = '/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json';

const allUrls = readFileSync(urlsPath, 'utf-8').trim().split('\n').filter(url => url.trim());
console.log(`Total URLs in file: ${allUrls.length}`);

// Load progress
let progress: ProgressData = JSON.parse(readFileSync(progressPath, 'utf-8'));
console.log(`Already processed: ${progress.totalProcessed} URLs`);
console.log(`Prague venues created: ${progress.pragueVenuesCreated}`);
console.log(`Non-Prague skipped: ${progress.nonPragueSkipped}`);

// Separate parent URLs from sub-location URLs
const parentUrls = allUrls.filter(url => {
  const parts = url.split('/prostory/')[1].split('/');
  return parts.length === 1 || (parts.length === 2 && parts[1] === '');
});

const subLocationUrls = allUrls.filter(url => {
  const parts = url.split('/prostory/')[1].split('/');
  return parts.length > 1 && parts[1] !== '';
});

console.log(`Parent URLs: ${parentUrls.length}`);
console.log(`Sub-location URLs: ${subLocationUrls.length}`);

// Filter out already processed URLs
const remainingParentUrls = parentUrls.filter(url => !progress.processedUrls.includes(url));
const remainingSubLocationUrls = subLocationUrls.filter(url => !progress.processedUrls.includes(url));

console.log(`Remaining parent URLs: ${remainingParentUrls.length}`);
console.log(`Remaining sub-location URLs: ${remainingSubLocationUrls.length}`);

// Helper function to extract venue slug from URL
function getVenueSlug(url: string): string {
  const parts = url.split('/prostory/')[1].replace(/\/$/, '').split('/');
  return parts[0];
}

// Helper function to get parent slug from sub-location URL
function getParentSlug(url: string): string | null {
  const parts = url.split('/prostory/')[1].replace(/\/$/, '').split('/');
  return parts.length > 1 ? parts[0] : null;
}

// Helper function to check if location is in Prague
function isPragueLocation(address: string, city: string): boolean {
  const lowerAddress = address.toLowerCase();
  const lowerCity = city.toLowerCase();

  return lowerCity.includes('praha') ||
         lowerCity.includes('prague') ||
         lowerAddress.includes('praha') ||
         lowerAddress.includes('prague');
}

// Helper function to scrape a single venue
async function scrapeVenue(url: string): Promise<VenueData | null> {
  console.log(`Scraping: ${url}`);

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract venue name
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract address and city
    const addressMatch = html.match(/adresa[^>]*>([^<]+)</i) ||
                        html.match(/address[^>]*>([^<]+)</i);
    const address = addressMatch ? addressMatch[1].trim() : '';

    // Determine city from address
    let city = 'Unknown';
    if (address.toLowerCase().includes('praha') || address.toLowerCase().includes('prague')) {
      city = 'Praha';
    } else if (address.toLowerCase().includes('bratislava')) {
      city = 'Bratislava';
    } else if (address.toLowerCase().includes('brno')) {
      city = 'Brno';
    }

    // Check if it's a Prague location
    if (!isPragueLocation(address, city)) {
      console.log(`Skipping ${name} - not in Prague (${city})`);
      return null;
    }

    // Extract capacity
    const capacityMatch = html.match(/kapacita[^>]*>([^<]+)</i) ||
                         html.match(/(\d+)\s*(osob|people|guests)/i);
    const capacity = capacityMatch ? parseInt(capacityMatch[1].replace(/\D/g, '')) : 0;

    // Extract description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const originalDesc = descMatch ? descMatch[1] : '';

    // Rewrite description (anti-plagiarism)
    const description = await rewriteDescription(originalDesc, name);

    // Extract venue types
    const venueTypes: string[] = [];
    if (html.includes('konference') || html.includes('meeting')) venueTypes.push('konference');
    if (html.includes('restaurant') || html.includes('restaurace')) venueTypes.push('restaurace');
    if (html.includes('hotel')) venueTypes.push('hotel');
    if (html.includes('bar') || html.includes('club')) venueTypes.push('bar');
    if (html.includes('galerie') || html.includes('gallery')) venueTypes.push('galerie');

    // Generate slug
    const slug = getVenueSlug(url);

    return {
      name,
      slug,
      description,
      address,
      city,
      district: extractDistrict(address),
      capacity,
      priceRange: 'Střední',
      venueTypes: venueTypes.length > 0 ? venueTypes : ['ostatni'],
      amenities: [],
      images: [],
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Helper function to rewrite description
async function rewriteDescription(original: string, venueName: string): Promise<string> {
  if (!original) {
    return `${venueName} je jedinečný prostor pro pořádání nejrůznějších akcí v Praze.`;
  }

  // Simple rewriting strategy - rephrase the description
  const variations = [
    `Prostor ${venueName} nabízí`,
    `${venueName} představuje`,
    `V prostorách ${venueName} najdete`,
    `${venueName} je ideální volbou pro`,
    `Navštivte ${venueName} a objevte`,
  ];

  const intro = variations[Math.floor(Math.random() * variations.length)];
  const rewritten = `${intro} výjimečné prostředí pro vaše akce. ${original.substring(0, 200)}`;

  return rewritten.substring(0, 500);
}

// Helper function to extract district from address
function extractDistrict(address: string): string {
  const districtMatch = address.match(/Praha\s+(\d+)/i);
  if (districtMatch) {
    return `Praha ${districtMatch[1]}`;
  }
  return 'Praha';
}

// Process venues in batches
async function processBatch(urls: string[], batchSize: number = 15) {
  const results = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);
    console.log(`URLs in batch: ${batch.length}`);

    for (const url of batch) {
      const venueData = await scrapeVenue(url);

      if (venueData) {
        // Create venue via API
        try {
          const response = await fetch('http://localhost:3000/api/admin/venues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(venueData),
          });

          if (response.ok) {
            progress.pragueVenuesCreated++;
            console.log(`✓ Created venue: ${venueData.name}`);
          } else {
            console.error(`✗ Failed to create venue: ${venueData.name}`);
          }
        } catch (error) {
          console.error(`Error creating venue:`, error);
        }
      } else {
        progress.nonPragueSkipped++;
      }

      // Update progress
      progress.processedUrls.push(url);
      progress.totalProcessed++;
      progress.lastProcessedUrl = url;

      // Save progress every 10 venues
      if (progress.totalProcessed % 10 === 0) {
        writeFileSync(progressPath, JSON.stringify(progress, null, 2));
        console.log(`Progress saved: ${progress.totalProcessed} total processed`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save after each batch
    writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`Batch complete. Progress saved.`);
  }
}

// Main execution
async function main() {
  console.log('\n=== Starting venue scraping ===\n');

  // Process remaining parent URLs first
  if (remainingParentUrls.length > 0) {
    console.log(`Processing ${remainingParentUrls.length} parent URLs...`);
    await processBatch(remainingParentUrls);
  }

  // Then process sub-locations
  if (remainingSubLocationUrls.length > 0) {
    console.log(`\nProcessing ${remainingSubLocationUrls.length} sub-location URLs...`);
    await processBatch(remainingSubLocationUrls);
  }

  // Final save
  writeFileSync(progressPath, JSON.stringify(progress, null, 2));

  console.log('\n=== Scraping Complete ===');
  console.log(`Total processed: ${progress.totalProcessed}`);
  console.log(`Prague venues created: ${progress.pragueVenuesCreated}`);
  console.log(`Non-Prague skipped: ${progress.nonPragueSkipped}`);
  console.log(`Duplicates skipped: ${progress.duplicatesSkipped}`);
  console.log(`Errors: ${progress.errors}`);
}

main().catch(console.error);
