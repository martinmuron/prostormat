import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CSVVenue {
  slug: string;
  name: string;
  website: string;
  email: string;
  source: string;
}

function parseCSV(csvPath: string): CSVVenue[] {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(1); // Skip header

  const venues: CSVVenue[] = [];

  for (const line of dataLines) {
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(currentPart);
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart);

    if (parts.length >= 5) {
      venues.push({
        slug: parts[0],
        name: parts[1],
        website: parts[2],
        email: parts[3],
        source: parts[4],
      });
    }
  }

  return venues;
}

function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(str1: string, str2: string): number {
  const s1 = normalizeForMatch(str1);
  const s2 = normalizeForMatch(str2);

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Simple word matching
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w));

  if (commonWords.length === 0) return 0;

  return commonWords.length / Math.max(words1.length, words2.length);
}

async function findMissingEmails() {
  console.log('🔍 Finding missing venue emails...\n');

  // Load CSV data
  const csvVenues = parseCSV('/tmp/venue-emails-websearch-results.csv');
  console.log(`📁 Loaded ${csvVenues.length} venues from CSV\n`);

  // Get active venues without emails
  const missingVenues = await prisma.venue.findMany({
    where: {
      status: { in: ['active', 'published'] },
      OR: [
        { contactEmail: null },
        { contactEmail: '' },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      contactEmail: true,
    },
  });

  console.log(`❌ Found ${missingVenues.length} active venues without emails\n`);
  console.log('🔎 Matching venues by name similarity...\n');

  let matched = 0;
  let notMatched = 0;
  const updates: Array<{ venueId: string; venueName: string; email: string; website: string; matchScore: number }> = [];

  for (const dbVenue of missingVenues) {
    let bestMatch: CSVVenue | null = null;
    let bestScore = 0;

    // Try exact slug match first
    const exactMatch = csvVenues.find(cv => cv.slug === dbVenue.slug);
    if (exactMatch && exactMatch.email) {
      updates.push({
        venueId: dbVenue.id,
        venueName: dbVenue.name,
        email: exactMatch.email,
        website: exactMatch.website,
        matchScore: 1.0,
      });
      matched++;
      continue;
    }

    // Try name similarity matching
    for (const csvVenue of csvVenues) {
      const score = similarity(dbVenue.name, csvVenue.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = csvVenue;
      }
    }

    if (bestMatch && bestScore >= 0.7 && bestMatch.email) {
      updates.push({
        venueId: dbVenue.id,
        venueName: dbVenue.name,
        email: bestMatch.email,
        website: bestMatch.website,
        matchScore: bestScore,
      });
      matched++;
    } else {
      notMatched++;
      console.log(`⚠️  No match for: ${dbVenue.name} (best score: ${bestScore.toFixed(2)})`);
    }

    if ((matched + notMatched) % 100 === 0) {
      console.log(`Progress: ${matched + notMatched}/${missingVenues.length} (matched: ${matched})`);
    }
  }

  console.log(`\n✅ Matched: ${matched}`);
  console.log(`❌ Not matched: ${notMatched}\n`);

  // Apply updates
  console.log('💾 Updating database...\n');
  let updated = 0;

  for (const update of updates) {
    try {
      await prisma.venue.update({
        where: { id: update.venueId },
        data: {
          contactEmail: update.email,
          websiteUrl: update.website || undefined,
        },
      });
      updated++;

      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated}/${updates.length} venues...`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.venueName}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total missing: ${missingVenues.length}`);
  console.log(`Matched: ${matched}`);
  console.log(`Updated: ${updated}`);
  console.log(`Not matched: ${notMatched}`);
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

findMissingEmails().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
