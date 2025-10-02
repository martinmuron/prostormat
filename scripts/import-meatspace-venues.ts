import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const remoteDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.');
  }

  process.env.DATABASE_URL = remoteDatabaseUrl;
}

const prisma = new PrismaClient();

interface MeatspaceVenue {
  slug: string;
  name: string;
  address: string;
  district: string | null;
  description: string;
  capacity: number;
  capacitySeated?: number;
  venueType: string;
  amenities: string[];
  isParent: boolean;
  parentSlug: string | null;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  meatspaceUrl: string;
}

interface VenueData {
  venues: MeatspaceVenue[];
}

// Map venue types to your database enum values
const venueTypeMap: Record<string, string> = {
  'conference': 'conference_center',
  'restaurant': 'restaurant',
  'hotel': 'hotel',
  'bar': 'bar',
  'multipurpose': 'event_space',
  'event_space': 'event_space',
  'studio': 'studio',
  'cottage': 'other',
  'museum': 'gallery',
  'outdoor': 'outdoor_space',
  'villa': 'villa',
  'historic': 'historic',
  'club': 'club',
  'meeting_room': 'meeting_room',
  'golf_resort': 'sports_venue',
  'gallery': 'gallery',
  'castle': 'historic',
  'wellness': 'other',
  'loft': 'loft',
  'barn': 'barn',
  'garden': 'garden',
  'resort': 'hotel',
};

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to extract city from address
function extractCity(address: string, district: string | null): string {
  if (address.includes('Praha') || district?.includes('Praha')) {
    return 'Praha';
  }

  const cities = ['Bratislava', 'Humpolec', 'Pardubice', 'Benešov', 'Znojmo', 'Lipno'];
  for (const city of cities) {
    if (address.includes(city)) {
      return city;
    }
  }

  return 'Praha'; // default
}

async function importMeatspaceVenues() {
  console.log('Starting Meatspace venue import...');

  // Find or create venue manager
  const manager = await prisma.user.findUnique({
    where: { email: 'newvenues@prostormat.cz' },
  });

  if (!manager) {
    throw new Error('Venue manager newvenues@prostormat.cz not found in database');
  }

  console.log(`Using venue manager: ${manager.email}`);

  // Read the JSON file
  const dataPath = path.join(__dirname, 'meatspace-venues-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const venueData: VenueData = JSON.parse(rawData);

  console.log(`Found ${venueData.venues.length} venues to import`);

  // First pass: Create all parent venues
  const parentVenues = venueData.venues.filter(v => v.isParent || !v.parentSlug);
  const createdVenues = new Map<string, string>(); // Map of slug to venue ID

  for (const venue of parentVenues) {
    try {
      console.log(`Creating parent venue: ${venue.name}`);

      const mappedType = venueTypeMap[venue.venueType] || 'event_space';

      const createdVenue = await prisma.venue.create({
        data: {
          name: venue.name,
          slug: venue.slug,
          description: venue.description,
          address: venue.address,
          district: venue.district,
          capacityStanding: venue.capacity,
          capacitySeated: venue.capacitySeated,
          venueType: mappedType,
          amenities: venue.amenities,
          contactEmail: venue.contactEmail,
          contactPhone: venue.contactPhone,
          websiteUrl: venue.websiteUrl || venue.meatspaceUrl,
          instagramUrl: venue.instagramUrl,
          status: 'published',
          managerId: manager.id,
          images: [],
        },
      });

      createdVenues.set(venue.slug, createdVenue.id);
      console.log(`✓ Created: ${venue.name} (ID: ${createdVenue.id})`);
    } catch (error) {
      console.error(`✗ Failed to create ${venue.name}:`, error);
    }
  }

  // Second pass: Create child venues with parent relationships
  const childVenues = venueData.venues.filter(v => v.parentSlug && !v.isParent);

  for (const venue of childVenues) {
    try {
      console.log(`Creating child venue: ${venue.name}`);

      const parentId = createdVenues.get(venue.parentSlug!);
      if (!parentId) {
        console.warn(`⚠ Parent venue not found for ${venue.name}, skipping...`);
        continue;
      }

      const mappedType = venueTypeMap[venue.venueType] || 'event_space';

      const createdVenue = await prisma.venue.create({
        data: {
          name: venue.name,
          slug: venue.slug,
          description: venue.description,
          address: venue.address,
          district: venue.district,
          capacityStanding: venue.capacity,
          capacitySeated: venue.capacitySeated,
          venueType: mappedType,
          amenities: venue.amenities,
          contactEmail: venue.contactEmail,
          contactPhone: venue.contactPhone,
          websiteUrl: venue.websiteUrl || venue.meatspaceUrl,
          instagramUrl: venue.instagramUrl,
          parentId: parentId,
          managerId: manager.id,
          status: 'published',
          images: [],
        },
      });

      createdVenues.set(venue.slug, createdVenue.id);
      console.log(`✓ Created child: ${venue.name} (ID: ${createdVenue.id}, Parent: ${parentId})`);
    } catch (error) {
      console.error(`✗ Failed to create child ${venue.name}:`, error);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total venues created: ${createdVenues.size}`);
  console.log(`Parent venues: ${parentVenues.length}`);
  console.log(`Child venues: ${childVenues.length}`);
}

// Run the import
importMeatspaceVenues()
  .then(() => {
    console.log('\n✓ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
