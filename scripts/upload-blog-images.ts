import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'venue-images'; // Using existing bucket

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration. Check .env.local file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping of image files to blog post slugs
const IMAGE_MAPPING = {
  'prostormat_blog_wedding.jpg': 'pribeh-svatby-v-individualni-hale',
  'prostormat_blog_checklist.jpg': 'nejcastejsi-chyby-pri-vyberu-eventoveho-prostoru',
  'prostormat_blog_konference.jpg': 'checklist-pro-planovani-konference',
  'prostormat_blog_korporat.jpg': 'magie-vecirku-atmosfera-diky-prostoru',
};

async function uploadBlogImage(
  imagePath: string,
  fileName: string,
  blogSlug: string
): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const storagePath = `blog/${blogSlug}.jpg`;

    console.log(`   Uploading: ${fileName} → ${storagePath}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`   ❌ Upload failed: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    console.log(`   ✅ Uploaded successfully!`);
    console.log(`   URL: ${data.publicUrl}\n`);

    return data.publicUrl;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Blog Images Upload to Supabase\n');
  console.log('=' .repeat(60) + '\n');

  const blogImagesDir = '/Users/martinmuron/Desktop/Webs/prostormat-dev/public/images/blog';
  const uploadedUrls: Record<string, string> = {};

  let successCount = 0;
  let errorCount = 0;

  for (const [fileName, blogSlug] of Object.entries(IMAGE_MAPPING)) {
    const imagePath = path.join(blogImagesDir, fileName);

    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  File not found: ${fileName}\n`);
      errorCount++;
      continue;
    }

    console.log(`📤 Processing: ${fileName}`);
    console.log(`   Blog: ${blogSlug}`);

    const publicUrl = await uploadBlogImage(imagePath, fileName, blogSlug);

    if (publicUrl) {
      uploadedUrls[blogSlug] = publicUrl;
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('=' .repeat(60));
  console.log('\n📊 Upload Summary:\n');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  if (Object.keys(uploadedUrls).length > 0) {
    console.log('📝 Uploaded Image URLs:\n');
    for (const [slug, url] of Object.entries(uploadedUrls)) {
      console.log(`   ${slug}:`);
      console.log(`   ${url}\n`);
    }
  }

  console.log('✨ Blog images upload complete!');
  console.log('   Next: Update fallback blog posts with these URLs\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
