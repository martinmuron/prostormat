import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const IMAGES_DIR = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images';

// Venues with their folder mappings
const VENUE_UPDATES = [
  { slug: 'hard-rock-cafe-praha_1.patro-lounge', folder: 'hard-rock-cafe-praha__1.patro-lounge' },
  { slug: 'hard-rock-cafe-praha_1.patro-lounge-1.patro-atrium', folder: 'hard-rock-cafe-praha__1.patro-lounge-1.patro-atrium' },
  { slug: 'hard-rock-cafe-praha_1.patro-suteren-romanske-sklepeni', folder: 'hard-rock-cafe-praha__1.patro-suteren-romanske-sklepeni' },
  { slug: 'hard-rock-cafe-praha_2.patro-mezzanine', folder: 'hard-rock-cafe-praha__2.patro-mezzanine' },
  { slug: 'ribs-of-prague', folder: 'ribs-of-prague' },
  { slug: 'spejle-jungmannova', folder: 'spejle-jungmannova' },
  { slug: 'prague-city-golf-vinor_restaurace-soul.ad', folder: 'prague-city-golf-vinor__restaurace-soul.ad' },
];

async function main() {
  console.log('🔧 Direct SQL Update for Venue Images\n');
  console.log('=' .repeat(70) + '\n');

  for (const { slug, folder } of VENUE_UPDATES) {
    console.log(`Processing: ${slug}`);

    // Get image files from folder
    const folderPath = path.join(IMAGES_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      console.error(`   ❌ Folder not found: ${folder}`);
      continue;
    }

    const imageFiles = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();

    if (imageFiles.length === 0) {
      console.log(`   ⚠️  No images found`);
      continue;
    }

    // Build image paths array (slug/filename format for Supabase)
    const imagePaths = imageFiles.map(file => `${slug}/${file}`);

    console.log(`   📁 Found ${imageFiles.length} images`);
    console.log(`   📝 First image: ${imagePaths[0]}`);

    // Direct SQL UPDATE using raw query
    try {
      await prisma.$executeRaw`
        UPDATE prostormat_venues
        SET images = ${imagePaths}::text[]
        WHERE slug = ${slug}
      `;

      console.log(`   ✅ Updated database with ${imagePaths.length} images\n`);
    } catch (error) {
      console.error(`   ❌ SQL Error:`, error);
    }
  }

  // Verify updates
  console.log('=' .repeat(70));
  console.log('\n📊 Verification:\n');

  const slugs = VENUE_UPDATES.map(v => v.slug);
  const results = await prisma.$queryRaw<Array<{ slug: string; name: string; img_count: number }>>`
    SELECT slug, name, array_length(images, 1) as img_count
    FROM prostormat_venues
    WHERE slug = ANY(${slugs})
    ORDER BY name
  `;

  results.forEach(r => {
    console.log(`   ${r.name}: ${r.img_count || 0} images`);
  });

  const totalImages = results.reduce((sum, r) => sum + (r.img_count || 0), 0);
  console.log(`\n   Total images: ${totalImages}`);
  console.log(`   Total venues: ${results.length}\n`);

  console.log('✨ Done!\n');
}

main()
  .catch((error) => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
