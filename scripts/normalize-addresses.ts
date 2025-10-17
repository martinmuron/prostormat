import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

// Comprehensive neighborhood to district mapping for Prague
const NEIGHBORHOOD_TO_DISTRICT: Record<string, number> = {
  // Praha 1
  'staré město': 1,
  'stare mesto': 1,
  'nové město': 1,
  'nove mesto': 1,
  'malá strana': 1,
  'mala strana': 1,
  'hradčany': 1,
  'hradcany': 1,
  'josefov': 1,

  // Praha 2
  'vinohrady': 2,
  'vyšehrad': 2,
  'vysehrad': 2,
  'nusle': 2,

  // Praha 3
  'žižkov': 3,
  'zizkov': 3,

  // Praha 4
  'michle': 4,
  'podolí': 4,
  'podoli': 4,
  'braník': 4,
  'branik': 4,
  'krč': 4,
  'krc': 4,
  'chodov': 4,
  'lhotka': 4,
  'hodkovičky': 4,
  'hodkovicky': 4,

  // Praha 5
  'smíchov': 5,
  'smichov': 5,
  'košíře': 5,
  'kosire': 5,
  'hlubočepy': 5,
  'hlubocepy': 5,
  'radlice': 5,
  'jinonice': 5,
  'barrandov': 5,

  // Praha 6
  'dejvice': 6,
  'bubeneč': 6,
  'bubenec': 6,
  'střešovice': 6,
  'stresovice': 6,
  'vokovice': 6,
  'veleslavín': 6,
  'veleslav': 6,
  'břevnov': 6,
  'brevnov': 6,

  // Praha 7
  'holešovice': 7,
  'holesovice': 7,
  'letná': 7,
  'letna': 7,
  'troja': 7,

  // Praha 8
  'karlín': 8,
  'karlin': 8,
  'libeň': 8,
  'liben': 8,
  'kobylisy': 8,
  'bohnice': 8,
  'ďáblice': 8,
  'dablice': 8,

  // Praha 9
  'vysočany': 9,
  'vysocany': 9,
  'prosek': 9,
  'střížkov': 9,
  'strizkov': 9,

  // Praha 10
  'vršovice': 10,
  'vrsovice': 10,
  'strašnice': 10,
  'strasnice': 10,
  'malešice': 10,
  'malesice': 10,
  'záběhlice': 10,
  'zabehlice': 10,

  // Praha 11 - 22
  'háje': 11,
  'haje': 11,
  'modřany': 12,
  'modrany': 12,
  'komořany': 13,
  'komorany': 13,
  'černý most': 14,
  'cerny most': 14,
  'hostivař': 15,
  'hostivar': 15,
  'radotín': 16,
  'radotin': 16,
  'řepy': 17,
  'repy': 17,
  'letňany': 18,
  'letnany': 18,
  'kbely': 19,
  'horní počernice': 20,
  'horni pocernice': 20,
  'újezd': 21,
  'ujezd': 21,
  'uhříněves': 22,
  'uhrineves': 22,
};

// Postal code to district mapping
function getDistrictFromPostalCode(address: string): number | null {
  // Match postal codes like: 110 00, 11000, 120 00, 150 00, etc.
  const match = address.match(/\b(1[0-9]{2})\s?(\d{2})\b/);
  if (!match) return null;

  const code = parseInt(match[1]);

  // Prague district postal code ranges
  if (code >= 110 && code <= 119) return 1;
  if (code >= 120 && code <= 129) return 2;
  if (code >= 130 && code <= 139) return 3;
  if (code >= 140 && code <= 149) return 4;
  if (code >= 150 && code <= 159) return 5;
  if (code >= 160 && code <= 169) return 6;
  if (code >= 170 && code <= 179) return 7;
  if (code >= 180 && code <= 189) return 8;
  if (code >= 190 && code <= 199) return 9;
  if (code >= 100 && code <= 109) return 10;

  return null;
}

interface NormalizationResult {
  originalAddress: string;
  normalizedAddress: string;
  originalDistrict: string | null;
  normalizedDistrict: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'MANUAL_REVIEW';
  reason: string;
  needsUpdate: boolean;
}

function extractDistrictNumber(address: string): { district: number | null; source: string } {
  const lowerAddress = address.toLowerCase();

  // 1. Try explicit "praha X" pattern
  const prahaMatch = lowerAddress.match(/\b(?:praha|prague)\s+(\d{1,2})\b/);
  if (prahaMatch) {
    const district = parseInt(prahaMatch[1]);
    if (district >= 1 && district <= 22) {
      return { district, source: 'explicit_praha_number' };
    }
  }

  // 2. Try postal code
  const postalDistrict = getDistrictFromPostalCode(address);
  if (postalDistrict) {
    return { district: postalDistrict, source: 'postal_code' };
  }

  // 3. Try neighborhood name matching
  for (const [neighborhood, district] of Object.entries(NEIGHBORHOOD_TO_DISTRICT)) {
    if (lowerAddress.includes(neighborhood)) {
      return { district, source: `neighborhood_${neighborhood}` };
    }
  }

  return { district: null, source: 'not_found' };
}

function cleanAddress(address: string, district: number | null): string {
  let cleaned = address;

  // Replace "Prague" with "Praha"
  cleaned = cleaned.replace(/\bPrague\b/gi, 'Praha');

  // Remove redundant district mentions like "Praha 1 -" or "- Praha 1"
  if (district) {
    cleaned = cleaned.replace(new RegExp(`[,\\s]*-?\\s*(?:Praha|Prague)\\s+${district}\\b[^,]*`, 'gi'), '');
  }

  // Remove standalone neighborhood names when we have district
  if (district) {
    for (const neighborhood of Object.keys(NEIGHBORHOOD_TO_DISTRICT)) {
      if (NEIGHBORHOOD_TO_DISTRICT[neighborhood] === district) {
        cleaned = cleaned.replace(new RegExp(`[,\\s]*-?\\s*${neighborhood}\\b`, 'gi'), '');
      }
    }
  }

  // Clean up extra spaces, commas, dashes
  cleaned = cleaned.replace(/\s*-\s*,/g, ',');
  cleaned = cleaned.replace(/,\s*-\s*/g, ', ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/^\s*,\s*/, '');
  cleaned = cleaned.replace(/\s*,\s*$/, '');
  cleaned = cleaned.trim();

  return cleaned;
}

function normalizeAddress(address: string, currentDistrict: string | null): NormalizationResult {
  const { district, source } = extractDistrictNumber(address);

  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'MANUAL_REVIEW' = 'MEDIUM';
  let reason = '';

  if (district === null) {
    // No district found
    if (address.toLowerCase().includes('praha') || address.toLowerCase().includes('prague')) {
      confidence = 'MANUAL_REVIEW';
      reason = 'Prague address but no district could be determined';
    } else {
      confidence = 'HIGH';
      reason = 'Non-Prague address, keeping as-is';
    }

    return {
      originalAddress: address,
      normalizedAddress: address.replace(/\bPrague\b/gi, 'Praha'),
      originalDistrict: currentDistrict,
      normalizedDistrict: null,
      confidence,
      reason,
      needsUpdate: address !== address.replace(/\bPrague\b/gi, 'Praha') || currentDistrict !== null
    };
  }

  // District found
  const cleanedAddress = cleanAddress(address, district);
  const normalizedDistrict = `Praha ${district}`;

  if (source === 'explicit_praha_number') {
    confidence = 'HIGH';
    reason = 'District explicitly mentioned in address';
  } else if (source === 'postal_code') {
    confidence = 'HIGH';
    reason = 'District determined from postal code';
  } else if (source.startsWith('neighborhood_')) {
    confidence = 'MEDIUM';
    reason = `District determined from neighborhood (${source.replace('neighborhood_', '')})`;
  }

  const needsUpdate =
    cleanedAddress !== address ||
    currentDistrict !== normalizedDistrict;

  return {
    originalAddress: address,
    normalizedAddress: cleanedAddress,
    originalDistrict: currentDistrict,
    normalizedDistrict,
    confidence,
    reason,
    needsUpdate
  };
}

async function analyzeAddresses(applyChanges: boolean = false) {
  console.log('🔍 Fetching all venues...\n');

  const venues = await prisma.venue.findMany({
    where: {
      status: 'published'
    },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      district: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`📊 Found ${venues.length} published venues\n`);

  const results: Array<{ venue: typeof venues[0]; result: NormalizationResult }> = [];

  for (const venue of venues) {
    const result = normalizeAddress(venue.address, venue.district);
    results.push({ venue, result });
  }

  // Statistics
  const needsUpdate = results.filter(r => r.result.needsUpdate);
  const highConfidence = results.filter(r => r.result.confidence === 'HIGH');
  const mediumConfidence = results.filter(r => r.result.confidence === 'MEDIUM');
  const lowConfidence = results.filter(r => r.result.confidence === 'LOW');
  const manualReview = results.filter(r => r.result.confidence === 'MANUAL_REVIEW');

  console.log('📈 Analysis Summary:');
  console.log(`   Total venues: ${venues.length}`);
  console.log(`   Need updates: ${needsUpdate.length}`);
  console.log(`   High confidence: ${highConfidence.length}`);
  console.log(`   Medium confidence: ${mediumConfidence.length}`);
  console.log(`   Low confidence: ${lowConfidence.length}`);
  console.log(`   Manual review needed: ${manualReview.length}\n`);

  // Show sample changes
  console.log('📝 Sample changes (first 10):\n');
  needsUpdate.slice(0, 10).forEach(({ venue, result }) => {
    console.log(`Venue: ${venue.name} (${venue.slug})`);
    console.log(`  Original Address: "${result.originalAddress}"`);
    console.log(`  New Address: "${result.normalizedAddress}"`);
    console.log(`  Original District: "${result.originalDistrict || 'null'}"`);
    console.log(`  New District: "${result.normalizedDistrict || 'null'}"`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Reason: ${result.reason}\n`);
  });

  if (manualReview.length > 0) {
    console.log('\n⚠️  Manual Review Required:\n');
    manualReview.forEach(({ venue, result }) => {
      console.log(`Venue: ${venue.name}`);
      console.log(`  Address: "${result.originalAddress}"`);
      console.log(`  Reason: ${result.reason}\n`);
    });
  }

  if (applyChanges) {
    console.log('\n✅ Applying changes to database...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const { venue, result } of needsUpdate) {
      if (result.confidence === 'MANUAL_REVIEW') {
        console.log(`⏭️  Skipping ${venue.name} - needs manual review`);
        continue;
      }

      try {
        await prisma.venue.update({
          where: { id: venue.id },
          data: {
            address: result.normalizedAddress,
            district: result.normalizedDistrict
          }
        });
        console.log(`✅ Updated: ${venue.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating ${venue.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   ⏭️  Skipped (manual review): ${manualReview.length}`);
  } else {
    console.log('\n💡 This was a preview. Run with --apply to make changes.');
    console.log('   Command: DATABASE_URL="..." npx tsx scripts/normalize-addresses.ts --apply\n');
  }
}

// Main execution
const applyChanges = process.argv.includes('--apply');

analyzeAddresses(applyChanges)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
