import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'venue-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration. Check .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadImage(
  imagePath: string,
  venueSlug: string,
  imageName: string
): Promise<string | null> {
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

    console.log(`      ✅ Uploaded: ${imageName}`);
    return storagePath;
  } catch (error) {
    console.error(`      ❌ Error:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Uploading Medusa Prague images...\n');

  // Get Medusa Prague venue
  const venue = await prisma.venue.findUnique({
    where: { slug: 'medusa-prague' },
    select: { id: true, slug: true, name: true },
  });

  if (!venue) {
    console.error('❌ Medusa Prague venue not found in database');
    process.exit(1);
  }

  console.log(`📍 Found venue: ${venue.name} (${venue.slug})\n`);

  // Check folder
  const folderPath = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images/medusa-prague';

  if (!fs.existsSync(folderPath)) {
    console.error('❌ Images folder not found');
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(folderPath).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  console.log(`📁 Found ${imageFiles.length} images\n`);

  const uploadedPaths: string[] = [];

  for (const imageFile of imageFiles) {
    const imagePath = path.join(folderPath, imageFile);
    const storagePath = await uploadImage(imagePath, venue.slug, imageFile);

    if (storagePath) {
      uploadedPaths.push(storagePath);
    }
  }

  // Update venue with image paths
  if (uploadedPaths.length > 0) {
    await prisma.venue.update({
      where: { id: venue.id },
      data: { images: uploadedPaths },
    });

    console.log(`\n✅ Successfully uploaded ${uploadedPaths.length} images`);
    console.log(`✅ Updated venue database record`);
  } else {
    console.error('\n❌ No images were uploaded');
    process.exit(1);
  }

  console.log('\n✨ Done!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
