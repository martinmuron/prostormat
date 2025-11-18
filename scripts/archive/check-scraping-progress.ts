#!/usr/bin/env tsx

/**
 * Check Scraping Progress
 *
 * This script checks the current state of venue scraping progress
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 SCRAPING PROGRESS REPORT\n');
  console.log('='.repeat(60));

  // Total venues in database
  const totalVenues = await prisma.venue.count();
  console.log(`\nTotal venues in database: ${totalVenues}`);

  // Venues by status
  const byStatus = await prisma.venue.groupBy({
    by: ['status'],
    _count: true
  });

  console.log('\nVenues by status:');
  byStatus.forEach(item => {
    console.log(`  ${item.status}: ${item._count}`);
  });

  // Prague venues
  const pragueVenues = await prisma.venue.count({
    where: {
      OR: [
        { district: { contains: 'Praha' } },
        { district: { contains: 'Karlín' } },
        { district: { contains: 'Vinohrady' } },
        { district: { contains: 'Žižkov' } },
        { district: { contains: 'Smíchov' } },
        { district: { contains: 'Holešovice' } }
      ]
    }
  });

  console.log(`\nPrague venues: ${pragueVenues}`);

  // Parent vs sub-location venues
  const parentVenues = await prisma.venue.count({
    where: { parentId: null }
  });

  const subLocationVenues = await prisma.venue.count({
    where: { parentId: { not: null } }
  });

  console.log(`\nParent venues: ${parentVenues}`);
  console.log(`Sub-locations: ${subLocationVenues}`);

  // Recently created venues
  const recentVenues = await prisma.venue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      slug: true,
      name: true,
      district: true,
      createdAt: true
    }
  });

  console.log('\n📅 Recently created venues (last 10):');
  recentVenues.forEach((venue, i) => {
    const date = venue.createdAt.toISOString().split('T')[0];
    console.log(`  ${i + 1}. ${venue.name} (${venue.district}) - ${date}`);
  });

  // Check for venues with missing data
  const missingEmail = await prisma.venue.count({
    where: { contactEmail: null }
  });

  const missingPhone = await prisma.venue.count({
    where: { contactPhone: null }
  });

  const missingDescription = await prisma.venue.count({
    where: { OR: [{ description: null }, { description: '' }] }
  });

  console.log('\n⚠️  Venues with missing data:');
  console.log(`  Missing email: ${missingEmail}`);
  console.log(`  Missing phone: ${missingPhone}`);
  console.log(`  Missing description: ${missingDescription}`);

  // URL progress
  const urlFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const totalUrls = fs.readFileSync(urlFile, 'utf-8')
    .split('\n')
    .filter(line => line.trim() && line.startsWith('http'))
    .length;

  const progress = ((totalVenues / totalUrls) * 100).toFixed(1);

  console.log('\n📈 Overall Progress:');
  console.log(`  Total URLs to process: ${totalUrls}`);
  console.log(`  Venues created: ${totalVenues}`);
  console.log(`  Remaining: ${totalUrls - totalVenues}`);
  console.log(`  Progress: ${progress}%`);

  console.log('\n' + '='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
