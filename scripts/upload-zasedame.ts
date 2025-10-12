import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'venue-images';
const IMAGES_DIR = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadImage(imagePath: string, venueSlug: string, imageName: string): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const storagePath = `${venueSlug}/${imageName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`      ❌ Upload failed: ${error.message}`);
      return null;
    }

    return storagePath;
  } catch (error) {
    console.error(`      ❌ Error:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Uploading Zasedame images...\n');

  const venue = await prisma.venue.findUnique({
    where: { slug: 'zasedame-cz' },
    select: { id: true, slug: true, name: true, images: true },
  });

  if (!venue) {
    console.error('❌ Zasedame venue not found');
    process.exit(1);
  }

  console.log(`📍 Found: ${venue.name} (${venue.slug})`);
  console.log(`📋 Current images in DB: ${venue.images?.length || 0}\n`);

  const folderPath = path.join(IMAGES_DIR, 'zasedame-cz');

  if (!fs.existsSync(folderPath)) {
    console.error('❌ Images folder not found');
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`📁 Found ${imageFiles.length} images\n`);

  const uploadedPaths: string[] = [];

  for (const imageFile of imageFiles) {
    const imagePath = path.join(folderPath, imageFile);
    const storagePath = await uploadImage(imagePath, venue.slug, imageFile);

    if (storagePath) {
      uploadedPaths.push(storagePath);
      process.stdout.write('.');
    } else {
      process.stdout.write('x');
    }
  }
  console.log('\n');

  if (uploadedPaths.length > 0) {
    console.log(`✅ Uploaded ${uploadedPaths.length} images to Supabase\n`);

    // Update database via direct SQL
    console.log('📝 Updating database...');
    const imagePaths = uploadedPaths.map(p => `'${p}'`).join(',\n  ');

    console.log(`\nSQL to execute:\nUPDATE prostormat_venues\nSET images = ARRAY[\n  ${imagePaths}\n]::text[]\nWHERE slug = '${venue.slug}';\n`);

    // Execute the update
    await prisma.$executeRaw`
      UPDATE prostormat_venues
      SET images = ${uploadedPaths}::text[]
      WHERE slug = ${venue.slug}
    `;

    console.log('✅ Database updated\n');

    // Verify
    const updated = await prisma.$queryRaw<Array<{ name: string; img_count: number }>>`
      SELECT name, array_length(images, 1) as img_count
      FROM prostormat_venues
      WHERE slug = ${venue.slug}
    `;

    console.log(`Verification: ${updated[0].name} - ${updated[0].img_count} images\n`);
  } else {
    console.error('❌ No images were uploaded');
    process.exit(1);
  }

  console.log('✨ Done!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
