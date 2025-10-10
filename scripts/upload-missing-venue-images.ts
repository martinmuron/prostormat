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
const IMAGES_DIR = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration. Check .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Venues with local images but missing database entries
const VENUES_TO_UPLOAD = [
  { slug: 'hard-rock-cafe-praha_1.patro-lounge', folder: 'hard-rock-cafe-praha__1.patro-lounge' },
  { slug: 'hard-rock-cafe-praha_1.patro-lounge-1.patro-atrium', folder: 'hard-rock-cafe-praha__1.patro-lounge-1.patro-atrium' },
  { slug: 'hard-rock-cafe-praha_1.patro-suteren-romanske-sklepeni', folder: 'hard-rock-cafe-praha__1.patro-suteren-romanske-sklepeni' },
  { slug: 'hard-rock-cafe-praha_2.patro-mezzanine', folder: 'hard-rock-cafe-praha__2.patro-mezzanine' },
  { slug: 'ribs-of-prague', folder: 'ribs-of-prague' },
  { slug: 'spejle-jungmannova', folder: 'spejle-jungmannova' },
  { slug: 'prague-city-golf-vinor_restaurace-soul.ad', folder: 'prague-city-golf-vinor__restaurace-soul.ad' },
];

interface UploadStats {
  totalVenues: number;
  venuesProcessed: number;
  venuesUpdated: number;
  totalImages: number;
  imagesUploaded: number;
  errors: number;
}

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

    return storagePath;
  } catch (error) {
    console.error(`      ❌ Error:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Bulk Upload Missing Venue Images\n');
  console.log('=' .repeat(70) + '\n');

  const stats: UploadStats = {
    totalVenues: VENUES_TO_UPLOAD.length,
    venuesProcessed: 0,
    venuesUpdated: 0,
    totalImages: 0,
    imagesUploaded: 0,
    errors: 0,
  };

  for (const venueConfig of VENUES_TO_UPLOAD) {
    stats.venuesProcessed++;
    console.log(`\n[${stats.venuesProcessed}/${stats.totalVenues}] Processing: ${venueConfig.slug}`);

    // Get venue from database
    const venue = await prisma.venue.findUnique({
      where: { slug: venueConfig.slug },
      select: { id: true, slug: true, name: true, images: true },
    });

    if (!venue) {
      console.error(`   ❌ Venue not found in database`);
      stats.errors++;
      continue;
    }

    console.log(`   📍 ${venue.name}`);

    // Force upload regardless of database state to ensure Supabase has files
    const currentImages = venue.images || [];
    console.log(`   📋 Current images in DB: ${currentImages.length}`);

    // Check folder exists
    const folderPath = path.join(IMAGES_DIR, venueConfig.folder);
    if (!fs.existsSync(folderPath)) {
      console.error(`   ❌ Folder not found: ${venueConfig.folder}`);
      stats.errors++;
      continue;
    }

    // Get image files
    const imageFiles = fs.readdirSync(folderPath).filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    if (imageFiles.length === 0) {
      console.log(`   ⚠️  No images found in folder`);
      continue;
    }

    stats.totalImages += imageFiles.length;
    console.log(`   📁 Found ${imageFiles.length} images`);

    // Upload images
    const uploadedPaths: string[] = [];
    for (const imageFile of imageFiles) {
      const imagePath = path.join(folderPath, imageFile);
      const storagePath = await uploadImage(imagePath, venue.slug, imageFile);

      if (storagePath) {
        uploadedPaths.push(storagePath);
        stats.imagesUploaded++;
        process.stdout.write('.');
      } else {
        stats.errors++;
        process.stdout.write('x');
      }
    }
    console.log(''); // New line after progress dots

    // Don't update database here - we already did that via SQL
    if (uploadedPaths.length > 0) {
      console.log(`   ✅ Uploaded ${uploadedPaths.length} images to Supabase`);
      stats.venuesUpdated++;
    } else {
      console.error(`   ❌ No images were uploaded`);
      stats.errors++;
    }
  }

  // Final stats
  console.log('\n' + '=' .repeat(70));
  console.log('\n📊 Upload Complete!\n');
  console.log(`   Total Venues: ${stats.totalVenues}`);
  console.log(`   Venues Processed: ${stats.venuesProcessed}`);
  console.log(`   Venues Updated: ${stats.venuesUpdated}`);
  console.log(`   Total Images: ${stats.totalImages}`);
  console.log(`   Images Uploaded: ${stats.imagesUploaded}`);
  console.log(`   Errors: ${stats.errors}\n`);

  if (stats.venuesUpdated === stats.totalVenues && stats.errors === 0) {
    console.log('✨ All venues successfully uploaded!\n');
  } else if (stats.errors > 0) {
    console.log('⚠️  Some errors occurred during upload\n');
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
