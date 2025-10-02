import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map of text files to venue data
const VENUE_MAPPING: Record<string, { slug: string; name: string }> = {
  'Alma_Prague_Venue.txt': { slug: 'alma-prague', name: 'Alma Prague' },
  'Arthurs_Pub_Venue.txt': { slug: 'arthurs-pub', name: "Arthur's Pub" },
  'Bar_Forbina_Venue.txt': { slug: 'bar-forbina', name: 'Bar Forbína' },
  'Bar_Monk_Venue.txt': { slug: 'bar-monk', name: 'Bar Monk' },
  'Bugsys_Bar_Venue.txt': { slug: 'bugsys-bar', name: "Bugsy's Bar" },
  'Deer_Restaurant_Venue.txt': { slug: 'deer-restaurant', name: 'Deer Restaurant' },
  'Hotel_U_Prince_Venue.txt': { slug: 'hotel-u-prince', name: 'Hotel U Prince' },
  'Kino_Pilotu_Venue.txt': { slug: 'kino-pilotu', name: 'Kino Pilotů' },
  'M1_Lounge_Venue.txt': { slug: 'm1-lounge', name: 'M1 Lounge' },
  'Medusa_Prague_Venue.txt': { slug: 'medusa-prague', name: 'Medusa Prague' },
  'Monkey_Bar_Prague_Venue.txt': { slug: 'monkey-bar-prague', name: 'Monkey Bar Prague' },
  'NoD_Venue.txt': { slug: 'nod', name: 'NoD' },
  'OX_Club_Prague_Venue.txt': { slug: 'ox-club-prague', name: 'OX Club Prague' },
  'Pytloun_Old_Armoury_Venue.txt': { slug: 'pytloun-old-armoury', name: 'Pytloun Old Armoury' },
  'Pytloun_Sky_Bar_Venue.txt': { slug: 'pytloun-sky-bar', name: 'Pytloun Sky Bar' },
  'Ribs_of_Prague_Venue.txt': { slug: 'ribs-of-prague', name: 'Ribs of Prague' },
  'Spejle_Jungmannova_Venue.txt': { slug: 'spejle-jungmannova', name: 'Špejle Jungmannova' },
  'Strecha_Radost_Venue.txt': { slug: 'strecha-radost', name: 'Střecha Radost' },
};

async function parseVenueFile(filePath: string): Promise<any> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const venueData: any = {
    images: [],
    amenities: [],
    spaceTypes: [],
  };

  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('Name:')) {
      venueData.name = trimmed.replace('Name:', '').trim();
    } else if (trimmed.startsWith('Description:')) {
      venueData.description = trimmed.replace('Description:', '').trim();
    } else if (trimmed.startsWith('Address:')) {
      venueData.address = trimmed.replace('Address:', '').trim();
    } else if (trimmed.startsWith('City:')) {
      venueData.city = trimmed.replace('City:', '').trim();
    } else if (trimmed.startsWith('Postal Code:')) {
      venueData.postalCode = trimmed.replace('Postal Code:', '').trim();
    } else if (trimmed.startsWith('Email:')) {
      venueData.email = trimmed.replace('Email:', '').trim();
    } else if (trimmed.startsWith('Phone:')) {
      venueData.phone = trimmed.replace('Phone:', '').trim();
    } else if (trimmed.startsWith('Website:')) {
      venueData.website = trimmed.replace('Website:', '').trim();
    } else if (trimmed.startsWith('Capacity Min:')) {
      venueData.capacityMin = parseInt(trimmed.replace('Capacity Min:', '').trim()) || 1;
    } else if (trimmed.startsWith('Capacity Max:')) {
      venueData.capacityMax = parseInt(trimmed.replace('Capacity Max:', '').trim()) || 100;
    } else if (trimmed.startsWith('Price Range:')) {
      venueData.priceRange = trimmed.replace('Price Range:', '').trim();
    } else if (trimmed.startsWith('Space Types:')) {
      currentSection = 'spaceTypes';
    } else if (trimmed.startsWith('Amenities:')) {
      currentSection = 'amenities';
    } else if (trimmed.startsWith('Images:')) {
      currentSection = 'images';
    } else if (trimmed.startsWith('-') && currentSection === 'spaceTypes') {
      venueData.spaceTypes.push(trimmed.replace('-', '').trim());
    } else if (trimmed.startsWith('-') && currentSection === 'amenities') {
      venueData.amenities.push(trimmed.replace('-', '').trim());
    } else if (trimmed.startsWith('-') && currentSection === 'images') {
      venueData.images.push(trimmed.replace('-', '').trim());
    }
  }

  return venueData;
}

async function main() {
  console.log('🔍 Checking for missing venues...\n');

  const prostoryDir = path.join(process.cwd(), 'Prostory');
  const files = fs.readdirSync(prostoryDir).filter(f => f.endsWith('.txt'));

  console.log(`📋 Found ${files.length} venue files\n`);

  // Get or create default manager
  let defaultManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  });

  if (!defaultManager) {
    console.log('📝 Creating default venue manager...');
    defaultManager = await prisma.user.create({
      data: {
        email: 'manager@prostormat.cz',
        name: 'Default Manager',
        role: 'venue_manager',
      }
    });
    console.log(`   ✅ Created manager: ${defaultManager.email}\n`);
  } else {
    console.log(`✅ Using existing manager: ${defaultManager.email}\n`);
  }

  // Check current venues
  const existingVenues = await prisma.venue.findMany({
    select: { slug: true, name: true }
  });

  console.log(`✅ Existing venues in database: ${existingVenues.length}`);
  existingVenues.forEach(v => console.log(`   - ${v.name} (${v.slug})`));

  console.log('\n');

  let added = 0;
  let skipped = 0;

  for (const file of files) {
    const mapping = VENUE_MAPPING[file];
    if (!mapping) {
      console.log(`⚠️  No mapping found for ${file}, skipping...`);
      continue;
    }

    // Check if venue already exists
    const exists = existingVenues.some(v => v.slug === mapping.slug);

    if (exists) {
      console.log(`⏭️  Skipping ${mapping.name} - already exists`);
      skipped++;
      continue;
    }

    console.log(`➕ Adding ${mapping.name}...`);

    try {
      const filePath = path.join(prostoryDir, file);
      const venueData = await parseVenueFile(filePath);

      await prisma.venue.create({
        data: {
          name: venueData.name || mapping.name,
          slug: mapping.slug,
          description: venueData.description || '',
          address: venueData.address || '',
          amenities: venueData.amenities || [],
          contactEmail: venueData.email || '',
          contactPhone: venueData.phone || '',
          websiteUrl: venueData.website || '',
          capacitySeated: venueData.capacityMin || 1,
          capacityStanding: venueData.capacityMax || 100,
          images: venueData.images || [],
          managerId: defaultManager.id,
          status: 'active',
        }
      });

      console.log(`   ✅ Added successfully\n`);
      added++;
    } catch (error) {
      console.error(`   ❌ Error: ${error}\n`);
    }
  }

  const finalCount = await prisma.venue.count();

  console.log('\n✨ Summary:');
  console.log(`   ➕ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total venues in database: ${finalCount}`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
