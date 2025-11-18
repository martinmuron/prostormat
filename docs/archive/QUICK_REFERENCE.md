# Meatspace.cz Scraping - Quick Reference

## 🚀 Quick Start

```bash
# Check progress
npx tsx scripts/check-scraping-progress.ts

# Process batch
npx tsx scripts/batch-scrape-venues.ts --batch=N
```

## 📝 WebFetch Prompt Template

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

## 📋 Batch File Template

```json
[
  {
    "url": "https://www.meatspace.cz/prostory/venue-slug/",
    "slug": "venue-slug",
    "name": "Venue Name",
    "description": "REWRITTEN description here...",
    "address": "Street Address",
    "city": "Praha",
    "district": "Praha X",
    "postalCode": "XXX XX",
    "contactEmail": null,
    "contactPhone": null,
    "websiteUrl": null,
    "instagramUrl": null,
    "capacitySeated": 50,
    "capacityStanding": 100,
    "venueType": "Event Space",
    "amenities": ["WiFi", "Air conditioning"],
    "isPrague": true
  }
]
```

## 🏙️ Prague Locations (Include)

Praha 1-22, Karlín, Žižkov, Vinohrady, Smíchov, Holešovice, Dejvice, Nusle, Vršovice, Libeň, Malá Strana, Staré Město, Nové Město

## 🚫 Non-Prague (Exclude)

Bratislava, Brno, Ostrava, "near Prague", Mladá Boleslav, any city outside Prague

## 🔧 Verification Commands

```bash
# Total venues
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.venue.count().then(c => { console.log('Total:', c); p.\$disconnect(); });"

# Check specific venue
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.venue.findUnique({ where: { slug: 'venue-slug' }, select: { name: true, status: true } }).then(v => { console.log(v); p.\$disconnect(); });"
```

## 📊 Current Status

- **Total URLs**: 1,129
- **Processed**: ~20
- **Remaining**: ~1,109
- **Progress**: 1.8%

## 📁 File Locations

- URLs: `/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt`
- Batches: `/data/scraped-batch-N.json`
- Scripts: `/scripts/`

## ⚡ Workflow

1. Read 10-15 URLs from file
2. Scrape with WebFetch
3. Rewrite descriptions
4. Create batch JSON
5. Run processor
6. Verify
7. Repeat

## ⚠️ Critical Rules

1. ✅ Always rewrite descriptions (no plagiarism)
2. ✅ Filter Prague only (`isPrague: true/false`)
3. ✅ Parents before sub-locations
4. ✅ Verify each batch before processing

## 📖 Full Documentation

- `/SCRAPING_GUIDE.md` - Complete guide
- `/SCRAPING_SUMMARY.md` - Overview & recommendations
- `/QUICK_REFERENCE.md` - This file
