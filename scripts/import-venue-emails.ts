import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VenueEmailRecord {
  slug: string;
  name: string;
  website: string;
  email: string;
  source: string;
}

async function importVenueEmails() {
  console.log('🚀 Starting venue email import...\n');

  // Read CSV file
  const csvPath = '/tmp/venue-emails-websearch-results.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());

  // Skip header
  const dataLines = lines.slice(1);

  console.log(`📁 Found ${dataLines.length} venues to update\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const line of dataLines) {
    // Simple CSV parser: split by comma but respect quotes
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
    parts.push(currentPart); // Add last part

    if (parts.length < 5) {
      console.log(`⚠️  Skipping malformed line: ${line.substring(0, 50)}...`);
      skipped++;
      continue;
    }

    const [slug, name, website, email, source] = parts;

    try {
      // Check if venue exists
      const venue = await prisma.venue.findUnique({
        where: { slug },
        select: { id: true, slug: true, contactEmail: true, websiteUrl: true },
      });

      if (!venue) {
        console.log(`❌ Venue not found: ${slug}`);
        errors++;
        continue;
      }

      // Update venue with email and website
      await prisma.venue.update({
        where: { slug },
        data: {
          contactEmail: email || venue.contactEmail,
          websiteUrl: website || venue.websiteUrl,
        },
      });

      updated++;
      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated} venues...`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total venues: ${dataLines.length}`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

importVenueEmails().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
