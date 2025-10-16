import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hlwgpjdhhjaibkqcyjts.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET_NAME = 'venue-images';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// List of the 31 venues we uploaded
const uploadedVenues = [
  'muzeum-slivovice-r-jelinek-bar-a-klub',
  'muzeum-slivovice-r-jelinek-ochutnavkova-cast',
  'muzeum-slivovice-r-jelinek-salonek-kampa',
  'muzeum-slivovice-r-jelinek-salonek-vizovice',
  'muzeum-slivovice-r-jelinek-venkovni-prostor',
  'vila-kajetanka-sal-roma',
  'vila-kajetanka-salonky',
  'vila-kajetanka-terasa',
  'dinosauria-private-tour',
  'dinosauria-birthday',
  'dinosauria-teambuilding-vr',
  'dinosauria-vzdelavaci-program',
  'dancing-house-hotel-dancing-house-cafe',
  'dancing-house-hotel-meeting-room',
  'dancing-house-hotel-restaurace-ginger-fred',
  'dancing-house-hotel-zasedaci-mistnost',
  'space-cafe-hub-karlin-berlin',
  'space-cafe-hub-karlin-milano',
  'space-cafe-hub-karlin-paris',
  'space-cafe-hub-karlin-podcast',
  'all-in-event-space-konferencni-mistnosti-new-york',
  'all-in-event-space-konferencni-sal-sydney',
  'all-in-event-space-bistro-sworm',
  'majaland-praha-family-day',
  'majaland-praha-pronajem-cely',
  'turquoise-prague-sal-v-muzeu',
  'turquoise-prague-zahrada',
  'oaks-prague-golfova-klubovna',
  'oaks-prague-golfove-hriste',
  'salabka-restaurace-vinarstvi',
  'mala-sin-galerie-manes',
];

async function getStorageFiles(venueSlug: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(venueSlug, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`   ❌ Error listing files: ${error.message}`);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Return full paths
    return data
      .filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map(file => `${venueSlug}/${file.name}`);
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
    return [];
  }
}

async function updateVenueImages(venueSlug: string, images: string[]) {
  const { error } = await supabase
    .from('prostormat_venues')
    .update({ images })
    .eq('slug', venueSlug);

  if (error) {
    console.error(`   ❌ Failed to update: ${error.message}`);
    return false;
  }

  return true;
}

async function main() {
  console.log('🔧 Fixing image paths for uploaded venues...\n');
  console.log(`📊 Processing ${uploadedVenues.length} venues\n`);

  let successCount = 0;
  let failCount = 0;
  let noFilesCount = 0;

  for (const venueSlug of uploadedVenues) {
    console.log(`\n📍 ${venueSlug}`);

    // Get actual files in Supabase Storage
    const storageFiles = await getStorageFiles(venueSlug);

    if (storageFiles.length === 0) {
      console.log(`   ⚠️  No files found in storage`);
      noFilesCount++;
      continue;
    }

    console.log(`   📁 Found ${storageFiles.length} files in storage`);

    // Update database with correct paths
    const success = await updateVenueImages(venueSlug, storageFiles);

    if (success) {
      console.log(`   ✅ Updated database with ${storageFiles.length} image paths`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to update database`);
      failCount++;
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully updated:  ${successCount}/${uploadedVenues.length}`);
  console.log(`❌ Failed:                ${failCount}/${uploadedVenues.length}`);
  console.log(`⚠️  No files in storage:  ${noFilesCount}/${uploadedVenues.length}`);
  console.log('='.repeat(80) + '\n');

  if (successCount > 0) {
    console.log('✅ Database paths have been updated to match Supabase Storage!');
  }
}

main();
