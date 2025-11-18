#!/usr/bin/env tsx

/**
 * Batch Venue Scraper
 *
 * This script processes venues in batches by reading pre-scraped data from JSON files.
 * The scraping is done manually using WebFetch tool, and this script creates the DB records.
 *
 * Usage:
 * 1. Scrape venues using WebFetch and save to data/scraped-batch-N.json
 * 2. Run: npx tsx scripts/batch-scrape-venues.ts --batch N
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ScrapedVenue {
  url: string;
  slug: string;
  parentSlug?: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district?: string;
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
}

async function createVenue(data: ScrapedVenue, managerId: string): Promise<void> {
  try {
    // Check if exists
    const existing = await prisma.venue.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      console.log(`  ⏭️  Already exists: ${data.slug}`);
      return;
    }

    // Find parent ID if needed
    let parentId: string | undefined;
    if (data.parentSlug) {
      const parent = await prisma.venue.findUnique({
        where: { slug: data.parentSlug },
        select: { id: true }
      });

      if (!parent) {
        console.error(`  ❌ Parent not found: ${data.parentSlug}`);
        return;
      }

      parentId = parent.id;
    }

    // Create venue
    await prisma.venue.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        address: data.address,
        district: data.district,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl,
        instagramUrl: data.instagramUrl,
        capacitySeated: data.capacitySeated,
        capacityStanding: data.capacityStanding,
        venueType: data.venueType,
        amenities: data.amenities,
        images: [],
        managerId,
        parentId,
        status: 'active'
      }
    });

    console.log(`  ✅ Created: ${data.name}`);
  } catch (error) {
    console.error(`  ❌ Error creating ${data.slug}:`, error);
  }
}

async function processBatch(batchNumber: number) {
  console.log(`\n📦 Processing Batch ${batchNumber}\n`);

  // Get manager
  const manager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!manager) {
    throw new Error('No venue manager found');
  }

  // Read batch file
  const batchFile = path.join(process.cwd(), 'data', `scraped-batch-${batchNumber}.json`);

  if (!fs.existsSync(batchFile)) {
    throw new Error(`Batch file not found: ${batchFile}`);
  }

  const venues: ScrapedVenue[] = JSON.parse(fs.readFileSync(batchFile, 'utf-8'));

  console.log(`Found ${venues.length} venues in batch\n`);

  // Process each venue
  for (const venue of venues) {
    if (!venue.isPrague) {
      console.log(`  ⏭️  Skipping non-Prague: ${venue.name} (${venue.city})`);
      continue;
    }

    await createVenue(venue, manager.id);
  }

  console.log(`\n✅ Batch ${batchNumber} complete`);
}

async function main() {
  const batchArg = process.argv.find(arg => arg.startsWith('--batch='));
  const batchNumber = batchArg ? parseInt(batchArg.split('=')[1]) : 1;

  await processBatch(batchNumber);

  const total = await prisma.venue.count();
  console.log(`\n📊 Total venues in database: ${total}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
