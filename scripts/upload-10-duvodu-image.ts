import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { db } from '../src/lib/db';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadAndUpdate() {
  const imagePath = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/Downloads/prostormat-blog-10-duvodu-proc-prostormat.jpg';
  const storagePath = 'blog/10-duvodu-proc-se-pripojit-k-prostormat.jpg';
  
  console.log('📤 Uploading image to Supabase...');
  
  const fileBuffer = fs.readFileSync(imagePath);
  
  const { error } = await supabase.storage
    .from('venue-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  
  if (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
  
  const { data } = supabase.storage
    .from('venue-images')
    .getPublicUrl(storagePath);
  
  const publicUrl = data.publicUrl;
  console.log('✅ Image uploaded:', publicUrl);
  
  // Update database
  console.log('💾 Updating blog post in database...');
  await db.blogPost.update({
    where: { id: 'fallback-10-duvodu-prostormat' },
    data: { coverImage: publicUrl }
  });
  
  console.log('✅ Blog post updated!');
  console.log(`\n🎉 Done! The image is now live at:\n${publicUrl}`);
}

uploadAndUpdate().catch(console.error).finally(() => process.exit(0));
