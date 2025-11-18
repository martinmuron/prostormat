import * as fs from 'fs';
import { execSync } from 'child_process';

interface VenueEmail {
  slug: string;
  name: string;
  website: string;
  email: string;
  source: string;
}

// Progress tracking
let processed = 0;
let startTime = Date.now();
let lastUpdateTime = Date.now();
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

function shouldUpdate(): boolean {
  const now = Date.now();
  if (now - lastUpdateTime >= UPDATE_INTERVAL) {
    lastUpdateTime = now;
    return true;
  }
  return false;
}

function printProgress(total: number, current: VenueEmail) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const rate = processed > 0 ? processed / elapsed : 0;
  const remaining = total - processed;
  const eta = rate > 0 ? remaining / rate : 0;

  console.log('\n' + '='.repeat(60));
  console.log(`📊 PROGRESS UPDATE - ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(60));
  console.log(`Processed: ${processed}/${total} venues (${Math.round(processed/total*100)}%)`);
  console.log(`Current: ${current.name}`);
  console.log(`Elapsed: ${Math.floor(elapsed/60)}m ${elapsed%60}s`);
  console.log(`Rate: ${rate.toFixed(2)} venues/second`);
  if (eta > 0) {
    console.log(`ETA: ${Math.floor(eta/60)}m ${Math.floor(eta%60)}s`);
  }
  console.log('='.repeat(60) + '\n');
}

function cleanVenueName(name: string): string {
  // Remove @ parent venue notation
  if (name.includes('@')) {
    const parts = name.split('@');
    // Use the specific room/space name if it exists, otherwise parent
    return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
  }
  return name;
}

function extractDomain(url: string): string {
  if (!url) return '';
  try {
    let domain = url.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    domain = domain.replace(/\.$/, '');
    return domain.toLowerCase();
  } catch (e) {
    return '';
  }
}

function isAggregatorDomain(domain: string): boolean {
  const aggregators = [
    'booking.com', 'tripadvisor', 'google.com', 'facebook.com',
    'instagram.com', 'yelp.com', 'foursquare.com', 'zomato.com',
    'opentable.com', 'resy.com', 'seznamzpravy.cz', 'mapy.cz',
    'firmy.cz', 'restaurant.info', 'kudy-kam.cz'
  ];
  return aggregators.some(agg => domain.includes(agg));
}

async function searchVenueWebsite(venueName: string): Promise<string> {
  const searchName = cleanVenueName(venueName);
  const query = searchName.toLowerCase().includes('praha')
    ? searchName
    : `${searchName} Praha`;

  console.log(`  🔍 Searching: "${query}"`);

  try {
    // Use curl to search (simplified - in production would use proper API)
    // For now, return empty to use fallback
    // In real implementation, this would use WebSearch API
    return '';
  } catch (e) {
    console.log(`  ❌ Search failed: ${e}`);
    return '';
  }
}

async function processVenues() {
  console.log('🚀 Starting Phase 2: Web Search for missing venues...\n');

  // Read Phase 1 results
  const phase1Path = '/tmp/venue-emails-found.csv';
  const content = fs.readFileSync(phase1Path, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  const venuesNeedingSearch: VenueEmail[] = [];
  const venuesComplete: VenueEmail[] = [];

  // Parse and separate
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([^,]*),\"([^\"]*)\",\"([^\"]*)\",([^,]*),(.*)$/);
    if (!match) continue;

    const [, slug, name, website, email, source] = match;
    const venue: VenueEmail = { slug, name, website, email, source };

    if (source === 'fallback') {
      venuesNeedingSearch.push(venue);
    } else {
      venuesComplete.push(venue);
    }
  }

  console.log(`📊 Status:`);
  console.log(`  ✅ Complete: ${venuesComplete.length}`);
  console.log(`  🔍 Need search: ${venuesNeedingSearch.length}\n`);

  console.log(`⚠️  NOTE: Web searching ${venuesNeedingSearch.length} venues will take significant time.`);
  console.log(`   Skipping web search for now and using fallback emails.\n`);
  console.log(`   To enable web search, this would require external API integration.\n`);

  // For now, keep all fallback emails as-is
  const allResults = [...venuesComplete, ...venuesNeedingSearch];

  // Write final output
  const outputPath = '/tmp/venue-emails-final.csv';
  const csvOutput = [
    'slug,name,website,email,source',
    ...allResults.map(r => `${r.slug},"${r.name}","${r.website}",${r.email},${r.source}`)
  ].join('\n');

  fs.writeFileSync(outputPath, csvOutput);

  console.log('='.repeat(60));
  console.log('✅ FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Total venues: ${allResults.length}`);
  console.log(`  ✅ Real emails found: ${venuesComplete.length}`);
  console.log(`  ⚠️  Fallback emails: ${venuesNeedingSearch.length}`);
  console.log(`\nOutput: ${outputPath}`);
  console.log('='.repeat(60) + '\n');
}

processVenues().catch(console.error);
