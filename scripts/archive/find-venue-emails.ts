import * as fs from 'fs';
import * as path from 'path';

interface Venue {
  slug: string;
  name: string;
  websiteUrl: string;
  contactEmail: string;
}

interface VenueEmail {
  slug: string;
  name: string;
  website: string;
  email: string;
  source: 'existing' | 'extracted_from_url' | 'web_search' | 'fallback';
}

// Progress tracking
let processed = 0;
let startTime = Date.now();
let lastUpdateTime = Date.now();

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

function extractDomain(url: string): string {
  if (!url) return '';

  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//, '');
    // Remove www
    domain = domain.replace(/^www\./, '');
    // Remove path
    domain = domain.split('/')[0];
    // Remove port
    domain = domain.split(':')[0];
    // Remove trailing dots
    domain = domain.replace(/\.$/, '');

    return domain.toLowerCase();
  } catch (e) {
    return '';
  }
}

function cleanVenueName(name: string): string {
  // Remove @ parent venue notation
  if (name.includes('@')) {
    const parts = name.split('@');
    return parts[parts.length - 1].trim(); // Use parent venue name
  }
  return name;
}

function generateFallbackEmail(slug: string): string {
  return `info@${slug}.cz`;
}

function shouldUpdate(): boolean {
  const now = Date.now();
  if (now - lastUpdateTime >= UPDATE_INTERVAL) {
    lastUpdateTime = now;
    return true;
  }
  return false;
}

function printProgress(total: number) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const rate = processed / elapsed;
  const remaining = total - processed;
  const eta = remaining / rate;

  console.log('\n' + '='.repeat(60));
  console.log(`📊 PROGRESS UPDATE - ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(60));
  console.log(`Processed: ${processed}/${total} venues (${Math.round(processed/total*100)}%)`);
  console.log(`Elapsed: ${Math.floor(elapsed/60)}m ${elapsed%60}s`);
  console.log(`Rate: ${rate.toFixed(2)} venues/second`);
  console.log(`ETA: ${Math.floor(eta/60)}m ${Math.floor(eta%60)}s`);
  console.log('='.repeat(60) + '\n');
}

async function processVenues() {
  console.log('🚀 Starting venue email finder...\n');

  // Read CSV
  const csvPath = '/tmp/all-venues-export.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());

  // Skip header
  const header = lines[0];
  const venueLines = lines.slice(1);

  console.log(`📁 Found ${venueLines.length} venues to process\n`);

  const results: VenueEmail[] = [];
  const stats = {
    existing: 0,
    extracted: 0,
    webSearch: 0,
    fallback: 0,
    noWebsite: [] as string[],
  };

  // Phase 1: Process existing emails and URLs (fast)
  console.log('📋 Phase 1: Processing existing data...\n');

  for (const line of venueLines) {
    // Parse CSV line (simple parser - assumes no commas in fields)
    const match = line.match(/^([^,]*),([^,]*),([^,]*),(.*)$/);
    if (!match) continue;

    const [, slug, name, websiteUrl, contactEmail] = match;

    // Check for existing valid email
    if (contactEmail && contactEmail.includes('@') && !contactEmail.includes('example.com')) {
      results.push({
        slug,
        name,
        website: websiteUrl || '',
        email: contactEmail,
        source: 'existing',
      });
      stats.existing++;
    }
    // Extract from websiteUrl
    else if (websiteUrl && websiteUrl.trim()) {
      const domain = extractDomain(websiteUrl);
      if (domain) {
        results.push({
          slug,
          name,
          website: websiteUrl,
          email: `info@${domain}`,
          source: 'extracted_from_url',
        });
        stats.extracted++;
      } else {
        // Fallback for malformed URLs
        results.push({
          slug,
          name,
          website: websiteUrl,
          email: generateFallbackEmail(slug),
          source: 'fallback',
        });
        stats.fallback++;
      }
    }
    // Need web search
    else {
      stats.noWebsite.push(name);
      // For now, use fallback (web search will be done in Phase 2)
      results.push({
        slug,
        name,
        website: '',
        email: generateFallbackEmail(slug),
        source: 'fallback',
      });
      stats.fallback++;
    }

    processed++;

    if (shouldUpdate()) {
      printProgress(venueLines.length);
    }
  }

  // Write results
  const outputPath = '/tmp/venue-emails-found.csv';
  const csvOutput = [
    'slug,name,website,email,source',
    ...results.map(r => `${r.slug},"${r.name}","${r.website}",${r.email},${r.source}`)
  ].join('\n');

  fs.writeFileSync(outputPath, csvOutput);

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('✅ PROCESSING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total venues processed: ${processed}`);
  console.log(`\nBreakdown by source:`);
  console.log(`  ✅ Existing emails: ${stats.existing}`);
  console.log(`  🔗 Extracted from URL: ${stats.extracted}`);
  console.log(`  🔍 Web search: ${stats.webSearch}`);
  console.log(`  ⚠️  Fallback: ${stats.fallback}`);
  console.log(`\nVenues without website: ${stats.noWebsite.length}`);
  console.log(`Output file: ${outputPath}`);
  console.log('='.repeat(60) + '\n');

  if (stats.noWebsite.length > 0 && stats.noWebsite.length <= 50) {
    console.log('\nVenues needing manual research:');
    stats.noWebsite.slice(0, 50).forEach(name => console.log(`  - ${name}`));
    if (stats.noWebsite.length > 50) {
      console.log(`  ... and ${stats.noWebsite.length - 50} more`);
    }
  }
}

processVenues().catch(console.error);
