# Meatspace.cz Venue Scraping Guide

## Overview

This guide explains how to scrape venue data from meatspace.cz and import it into the Prostormat database. The process has been tested and verified with an initial batch of 9 venues.

## Files Created

### Scripts
- `/scripts/scrape-meatspace-full.ts` - Full automated scraper (for reference)
- `/scripts/batch-scrape-venues.ts` - Batch processor for scraped data
- `/scripts/scrape-meatspace-venues.ts` - Original analysis script

### Data
- `/data/scraped-batch-1.json` - First batch (9 venues) - **COMPLETED**
- `/data/scraped-batch-N.json` - Future batches

### Documentation
- `/SCRAPING_GUIDE.md` - This file

## Process Overview

### Phase 1: Parent Venues (542 URLs)
Process all parent venue URLs first (URLs without sub-paths).

### Phase 2: Sub-Locations (587 URLs)
After all parents are created, process sub-locations (URLs with sub-paths like `/prostory/parent/sub-location/`).

## URL Source

All URLs are in: `/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt`

- Total URLs: 1,129
- Parent venues: 542
- Sub-locations: 587

## Step-by-Step Process

### Step 1: Scrape a Batch of Venues

Use Claude's WebFetch tool to scrape 10-20 venues at a time. For each URL, use this prompt:

```
Extract complete venue data in this exact JSON format:
{
  "name": "venue name from h1",
  "description": "full venue description/about text",
  "address": "street address",
  "city": "city name",
  "district": "district/neighborhood",
  "postalCode": "postal code if available",
  "contactEmail": "email if available",
  "contactPhone": "phone if available",
  "websiteUrl": "website URL if available",
  "instagramUrl": "instagram URL if available",
  "capacitySeated": number or null,
  "capacityStanding": number or null,
  "venueType": "venue type/category",
  "amenities": ["list", "of", "amenities"]
}

Return ONLY valid JSON, no extra text.
```

### Step 2: Create Batch JSON File

1. Compile the scraped data into a JSON array
2. Add these required fields to each venue:
   - `url`: The original meatspace.cz URL
   - `slug`: Extract from URL (e.g., `kafkoff` or `hotel-sen_conference-room`)
   - `parentSlug`: For sub-locations only (e.g., `hotel-sen`)
   - `isPrague`: Boolean - check if city/district is in Prague

3. **IMPORTANT: Rewrite descriptions** - Never copy-paste original descriptions. Rewrite them in your own words while keeping the same meaning and context.

4. Save as `/data/scraped-batch-N.json` where N is the batch number.

### Step 3: Run Batch Processor

```bash
npx tsx scripts/batch-scrape-venues.ts --batch=N
```

This will:
- Read the batch JSON file
- Skip non-Prague venues
- Skip already-existing venues
- Create new venues with status 'active'
- Link sub-locations to parents via `parentId`

## Prague Location Filtering

### Include (Prague locations):
- Praha, Prague
- Praha 1-22
- Karlín, Žižkov, Vinohrady, Smíchov, Holešovice
- Dejvice, Nusle, Vršovice, Libeň
- Malá Strana, Staré Město, Nové Město
- Letňany, Chodov, Háje, Černý Most
- Radotín, Zbraslav, Řepy, Stodůlky
- Kobylisy, Střížkov, Palmovka

### Exclude (Non-Prague):
- Bratislava, Brno, Ostrava
- Any city outside Prague region
- "near Prague" but not in Prague (e.g., "Ladův kraj")

## Batch Processing Strategy

### Recommended Batch Sizes:
- **Small batches (10-15 venues)**: Better control, easier to verify
- **Medium batches (20-30 venues)**: More efficient, manageable
- **Large batches (50+ venues)**: Only if confident in process

### Order of Processing:
1. **Batch 1-35**: Parent venues (542 ÷ 15 = ~36 batches)
2. **Batch 36-75**: Sub-locations (587 ÷ 15 = ~40 batches)

## Example Batch File Structure

```json
[
  {
    "url": "https://www.meatspace.cz/prostory/kafkoff/",
    "slug": "kafkoff",
    "name": "Kafkoff",
    "description": "Rewritten unique description here...",
    "address": "U Radnice, Staré Město",
    "city": "Praha",
    "district": "Praha 1",
    "postalCode": "110 00",
    "contactEmail": null,
    "contactPhone": null,
    "websiteUrl": null,
    "instagramUrl": null,
    "capacitySeated": 80,
    "capacityStanding": 250,
    "venueType": "Bar & Event Space",
    "amenities": ["WiFi", "Air conditioning", "Sound system"],
    "isPrague": true
  }
]
```

## Sub-Location Example

```json
{
  "url": "https://www.meatspace.cz/prostory/hotel-sen/conference-room/",
  "slug": "hotel-sen_conference-room",
  "parentSlug": "hotel-sen",
  "name": "Hotel SEN - Conference Room",
  "description": "...",
  "city": "Praha",
  "district": "Praha 6",
  "isPrague": true
}
```

## Verification Commands

### Check venue count:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.venue.count().then(count => {
  console.log('Total venues:', count);
  prisma.\$disconnect();
});
"
```

### Check specific venues:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.venue.findMany({
  where: { slug: { in: ['kafkoff', 'bar-monk-prague'] } },
  select: { slug: true, name: true, status: true }
}).then(venues => {
  console.log(JSON.stringify(venues, null, 2));
  prisma.\$disconnect();
});
"
```

### Check Prague venues only:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.venue.count({
  where: {
    OR: [
      { district: { contains: 'Praha' } },
      { district: { contains: 'Karlín' } },
      { district: { contains: 'Vinohrady' } }
    ]
  }
}).then(count => {
  console.log('Prague venues:', count);
  prisma.\$disconnect();
});
"
```

## Common Issues & Solutions

### Issue: "Parent not found"
**Solution**: Ensure parent venues are created before sub-locations. Process in correct order.

### Issue: "Already exists"
**Solution**: This is expected. The script skips duplicates automatically.

### Issue: Non-Prague venue created
**Solution**: Check the `isPrague` field in JSON. Set to `false` for non-Prague venues.

### Issue: Description is plagiarized
**Solution**: Always rewrite descriptions. Use AI to paraphrase while keeping meaning.

## Progress Tracking

Create a spreadsheet or document to track:
- Batch number
- URLs processed (start-end)
- Venues created
- Venues skipped (already exist)
- Non-Prague skipped
- Date processed
- Notes/issues

## Next Steps

1. **Continue with Batch 2**: Scrape next 15 parent venues
2. **Verify data quality**: Check created venues in database
3. **Monitor progress**: Track completion rate
4. **Complete Phase 1**: All 542 parent venues
5. **Start Phase 2**: Sub-locations (only after parents are done)

## Automation Opportunities

For future improvement, consider:
- Web scraping library (Puppeteer, Playwright)
- OpenAI API for description rewriting
- Bulk processing scripts
- Error handling and retry logic
- Progress persistence (resume from checkpoint)

## Current Status

✅ **Completed:**
- Initial batch (9 venues) successfully imported
- Scraping process validated
- Batch processing script working
- Documentation created

📊 **Statistics:**
- Total venues in database: 30
- New venues from batch 1: 2
- Already existing: 7
- Remaining URLs: ~1,120

🎯 **Next Goal:**
- Process batches 2-10 (next 100-150 parent venues)
- Verify all Prague filtering works correctly
- Establish efficient workflow pattern
