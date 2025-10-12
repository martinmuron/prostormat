import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'venue-images';
const VENUE_SLUG = 'zasedame-cz';
const FOLDER_PATH = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images/zasedame-cz';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadImage(imagePath: string, imageName: string): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const storagePath = `${VENUE_SLUG}/${imageName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`❌ ${imageName}: ${error.message}`);
      return null;
    }

    return storagePath;
  } catch (error) {
    console.error(`❌ ${imageName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Uploading Zasedame images to Supabase...\n');

  if (!fs.existsSync(FOLDER_PATH)) {
    console.error('❌ Folder not found');
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(FOLDER_PATH)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`📁 Found ${imageFiles.length} images\n`);

  const uploaded: string[] = [];
  let count = 0;

  for (const imageFile of imageFiles) {
    count++;
    const imagePath = path.join(FOLDER_PATH, imageFile);
    const storagePath = await uploadImage(imagePath, imageFile);

    if (storagePath) {
      uploaded.push(storagePath);
      console.log(`[${count}/${imageFiles.length}] ✅ ${imageFile}`);
    } else {
      console.log(`[${count}/${imageFiles.length}] ❌ ${imageFile}`);
    }
  }

  console.log(`\n✅ Uploaded ${uploaded.length}/${imageFiles.length} images\n`);
}

main().catch(console.error);
