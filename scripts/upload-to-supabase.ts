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

interface UploadStats {
  foldersScanned: number;
  foldersMatched: number;
  foldersDeleted: number;
  imagesUploaded: number;
  venuesUpdated: number;
  errors: number;
}

function slugToFolderName(slug: string): string {
  // Convert database slug to folder name
  // slug: "space-cafe-hub-karlin_berlin-meeting-room"
  // folder: "space-cafe-hub-karlin__berlin-meeting-room"
  return slug.replace(/_/g, '__');
}

function folderNameToSlug(folderName: string): string {
  // Convert folder name to database slug
  // folder: "space-cafe-hub-karlin__berlin-meeting-room"
  // slug: "space-cafe-hub-karlin_berlin-meeting-room"
  return folderName.replace(/__/g, '_');
}

async function ensureBucketExists() {
  console.log('🗂️  Checking Supabase storage bucket...\n');

  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`   Creating bucket: ${BUCKET_NAME}`);
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
      console.error(`   ❌ Error creating bucket:`, error);
      throw error;
    }
    console.log(`   ✅ Bucket created\n`);
  } else {
    console.log(`   ✅ Bucket exists\n`);
  }
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
  console.log('🚀 Supabase Image Upload & Optimization\n');
  console.log('=' .repeat(60) + '\n');

  const stats: UploadStats = {
    foldersScanned: 0,
    foldersMatched: 0,
    foldersDeleted: 0,
    imagesUploaded: 0,
    venuesUpdated: 0,
    errors: 0,
  };

  // Ensure bucket exists
  await ensureBucketExists();

  // Get all venues from database
  console.log('📊 Loading venues from database...\n');
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  const venueSlugMap = new Map(venues.map(v => [v.slug, v]));
  console.log(`   Found ${venues.length} venues in database\n`);

  // Scan image folders
  const imagesDir = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images';
  const folders = fs.readdirSync(imagesDir).filter(f => {
    const fullPath = path.join(imagesDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  console.log(`📁 Scanning ${folders.length} image folders...\n`);
  stats.foldersScanned = folders.length;

  const foldersToDelete: string[] = [];
  const foldersToProcess: Array<{ folder: string; slug: string; venue: any }> = [];

  // Match folders to venues
  for (const folder of folders) {
    const slug = folderNameToSlug(folder);
    const venue = venueSlugMap.get(slug);

    if (venue) {
      foldersToProcess.push({ folder, slug, venue });
      stats.foldersMatched++;
    } else {
      foldersToDelete.push(folder);
    }
  }

  console.log(`✅ Matched folders: ${stats.foldersMatched}`);
  console.log(`❌ Unmatched folders (will delete): ${foldersToDelete.length}\n`);

  // Delete non-Prague venue folders
  if (foldersToDelete.length > 0) {
    console.log('🗑️  Deleting non-Prague venue folders...\n');
    for (const folder of foldersToDelete) {
      try {
        const folderPath = path.join(imagesDir, folder);
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`   ✅ Deleted: ${folder}`);
        stats.foldersDeleted++;
      } catch (error) {
        console.error(`   ❌ Failed to delete ${folder}:`, error);
        stats.errors++;
      }
    }
    console.log(`\n   Deleted ${stats.foldersDeleted} folders\n`);
  }

  // Upload images for matched venues
  console.log('📤 Uploading images to Supabase...\n');

  let processedCount = 0;
  for (const { folder, slug, venue } of foldersToProcess) {
    processedCount++;
    console.log(`[${processedCount}/${foldersToProcess.length}] Processing: ${venue.name}`);

    const folderPath = path.join(imagesDir, folder);
    const imageFiles = fs.readdirSync(folderPath).filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    if (imageFiles.length === 0) {
      console.log(`   ⚠️  No images found\n`);
      continue;
    }

    const uploadedPaths: string[] = [];

    for (const imageFile of imageFiles) {
      const imagePath = path.join(folderPath, imageFile);
      const storagePath = await uploadImage(imagePath, slug, imageFile);

      if (storagePath) {
        uploadedPaths.push(storagePath);
        stats.imagesUploaded++;
      } else {
        stats.errors++;
      }
    }

    // Update venue with image paths
    if (uploadedPaths.length > 0) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: { images: uploadedPaths },
      });

      console.log(`   ✅ Uploaded ${uploadedPaths.length} images\n`);
      stats.venuesUpdated++;
    }
  }

  // Final stats
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Upload Complete!\n');
  console.log(`   Folders Scanned: ${stats.foldersScanned}`);
  console.log(`   Folders Matched: ${stats.foldersMatched}`);
  console.log(`   Folders Deleted: ${stats.foldersDeleted}`);
  console.log(`   Images Uploaded: ${stats.imagesUploaded}`);
  console.log(`   Venues Updated: ${stats.venuesUpdated}`);
  console.log(`   Errors: ${stats.errors}\n`);

  console.log('✨ All images are now in Supabase Storage!');
  console.log('   Images will be automatically optimized using Supabase transforms.\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
