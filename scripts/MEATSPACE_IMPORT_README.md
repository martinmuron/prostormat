# Meatspace Venue Import Guide

## Overview

This directory contains tools and data for importing venues from meatspace.cz into the Prostormat database.

## Files

- **meatspace-venues-data.json** - JSON file containing scraped venue data (currently 60+ venues)
- **import-meatspace-venues.ts** - TypeScript script to import venues into Prisma database
- **MEATSPACE_IMPORT_README.md** - This file

## Current Status

**Scraped Venues:** 60+ out of 179 total URLs
**Parent-Child Relationships:** Properly structured

### Venues with Sub-locations (Parent-Child)

The following venues have been identified as parent venues with sub-locations:

1. **Falkensteiner Hotel Prague**
   - The Monkey Bar Prague
   - Boardroom

2. **Centrum Jasoň**
   - Multifunkční sál
   - Cvičebna
   - Ateliér

3. **Vila Kajetánka**
   - Salónky
   - Hlavní sál
   - Terasa

4. **Národní dům na Vinohradech**
   - (Sub-locations need to be scraped)

5. **Automatické mlýny**
   - (Sub-locations need to be scraped)

6. **Vzlet**
   - (Sub-locations need to be scraped)

7. **HUB na poli**
   - Industriál
   - Ateliér
   - Pole designu

8. **Prague City Golf Vinoř**
   - (Sub-locations need to be scraped)

9. **Konferenční centrum Krocínova**
   - (Sub-locations need to be scraped)

10. **Zasedáme**
    - (Sub-locations need to be scraped)

## Data Structure

Each venue in the JSON file has the following structure:

```json
{
  "slug": "venue-slug",
  "name": "Venue Name",
  "address": "Full Address",
  "district": "Praha 1" (or null),
  "description": "Description in Czech",
  "capacity": 100,
  "capacitySeated": 80 (optional),
  "venueType": "restaurant|hotel|bar|etc",
  "amenities": ["WiFi", "Klimatizace", "Ozvučení"],
  "isParent": false,
  "parentSlug": null (or "parent-venue-slug"),
  "contactEmail": "email@example.com" (optional),
  "contactPhone": "+420..." (optional),
  "websiteUrl": "https://..." (optional),
  "instagramUrl": "https://instagram.com/..." (optional),
  "meatspaceUrl": "https://www.meatspace.cz/prostory/..."
}
```

## Venue Types Mapping

The import script maps meatspace venue types to Prostormat database types:

| Meatspace Type | Database Type |
|----------------|---------------|
| conference | conference_center |
| restaurant | restaurant |
| hotel | hotel |
| bar | bar |
| multipurpose | event_space |
| event_space | event_space |
| studio | studio |
| museum | gallery |
| outdoor | outdoor_space |
| villa | villa |
| historic | historic |
| club | club |
| meeting_room | meeting_room |
| golf_resort | sports_venue |
| castle | historic |
| loft | loft |
| barn | barn |
| garden | garden |
| resort | hotel |

## How to Use

### 1. Complete the Scraping (Optional)

If you want to scrape the remaining venues, you can continue using the web scraping approach:

```typescript
// Example for scraping more venues
const urlsToScrape = [
  "https://www.meatspace.cz/prostory/new-venue-1/",
  "https://www.meatspace.cz/prostory/new-venue-2/",
  // ... more URLs
];
```

Add the results to `meatspace-venues-data.json` following the existing structure.

### 2. Review the Data

Before importing, review `meatspace-venues-data.json` and:
- Verify venue information is accurate
- Check parent-child relationships
- Ensure all required fields are present
- Add any missing contact information

### 3. Run the Import Script

```bash
# Make sure you're in the project root
cd /Users/martinmuron/Desktop/Webs/prostormat-dev

# Install dependencies if needed
npm install

# Run the import script
npx tsx scripts/import-meatspace-venues.ts
```

The script will:
1. Create all parent venues first
2. Create child venues with proper parent relationships
3. Log progress and any errors
4. Display a summary at the end

### 4. Verify the Import

After running the script, verify the venues in your database:

```bash
# Open Prisma Studio to view imported venues
npx prisma studio
```

## Remaining URLs to Scrape

Here are the remaining URLs that still need to be scraped (119 venues):

### Already Scraped (60 venues)
✓ narodni-21
✓ automat-aviatica
✓ turnovska-pivnice-vrsovice
✓ turnovska-pivnice-churchill
✓ turnovska-pivnice-waltrovka
✓ turnovska-pivnice-brumlovka
✓ iyengar-yoga-institut-praha
✓ 2-deci-komorni-prostor-pro-akce
✓ kulickario
✓ chalupa-nonnetit
✓ little-italy
✓ fabrika-hotel
✓ atma-community-space
✓ falkensteiner-hotel-prague (+ sub-locations)
✓ ponton-bratislava
✓ mozart-interactive-museum
✓ jezero.ooo
✓ centrum-jason (+ sub-locations)
✓ vila-kajetanka (+ sub-locations)
✓ narodni-dum-na-vinohradech
✓ automaticke-mlyny
✓ vzlet
✓ hub-na-poli
✓ prague-city-golf-vinor
✓ konferencni-centrum-krocinova
✓ petrohradska-galerie
✓ zasedame-cz
✓ fat-cat-bubbles-bar
✓ oaza-lahovicky
✓ zamek-lisno
✓ hotel-jezerka
✓ ox-prague-club
✓ grand-hotel-international-prague
✓ the-factory-loft-prague
✓ stodola-suska
✓ zero-latency-prague
✓ sumo-garden
✓ casablanca-sky-bar
✓ molo-lipno
✓ golf-resort-black-bridge

### Still Need to Scrape (119 venues)

**Sub-locations:**
- narodni-dum-na-vinohradech/majakovskeho-sal
- narodni-dum-na-vinohradech/raisuv-sal
- narodni-dum-na-vinohradech/spolecensky-sal
- narodni-dum-na-vinohradech/salonky
- automaticke-mlyny/amfiteatr
- automaticke-mlyny/piazzetta
- automaticke-mlyny/terasa
- vzlet/klubovna
- vzlet/male-foyer
- vzlet/velky-sal
- hub-na-poli/industrial
- hub-na-poli/pole-designu
- prague-city-golf-vinor/multifunkcni-mistnost
- prague-city-golf-vinor/lounge
- prague-city-golf-vinor/restaurace-soul.ad
- prague-city-golf-vinor/venkovni-prostory
- konferencni-centrum-krocinova/jednaci-a-skolici-mistnost-a
- konferencni-centrum-krocinova/jednaci-a-skolici-mistnost-b
- konferencni-centrum-krocinova/konferencni-sal-a-foyer
- zasedame_cz/zasedame_cz-velka-mistnost-pro-akce
- zasedame_cz/zasedame_cz-velka-mistnost-pro-akce-1
- zasedame_cz/stredni-mistnost-jungmannovo-namesti
- petrohradska-kolektiv/petrohradska-kino

**Standalone venues:**
- oaza-lahovicky
- new-new-studio
- 2-deci-vinohrady
- the-apartment
- le-terroir
- dog-in-dock-vinarstvi-a-eventove-centrum
- bar-behind-the-curtain
- dejavu-music-bar-prague
- bar-kobka-8
- orea-resort-panorama-moravsky-kras
- orea-hotel-angelo-praha
- orea-hotel-pyramida-praha
- port-lounge-bar-prague
- beltine-forest-hotel
- aqualand-inn
- kluziste-petra
- vila-tusculum
- cistirna-stodola
- venkovni-prostory-cistirny
- tempo-andel
- revir-karlin
- chata-na-seraku
- spot-gallery
- hotel-praded-thamm
- chaty-capak
- zazitkovy-vlak-kds
- dergi-lounge
- woowoo-studio
- bistro-na-chlebu
- rosmarino-kvetinovy-atelier
- vila-barrandov
- vila-zlaty-slavik-jevany
- prostor-mikovcova
- klubovna-2-patro
- malsovicka-arena
- everything
- hrad-strekov
- zamek-decin
- dum-kultury-litomerice
- zahrada-cech
- zamek-slavkov-austerlitz
- ibis-styles-relax-roznov-pod-radhostem
- hotel-skanzen
- hotel-tanecnica
- hotel-ricky
- hotel-pecr
- grund-resort
- sonnentor
- zamecky-hotel-valtice
- zasedacka
- q5-gallery
- kulturni-centrum-lovos
- a-la-petite-eiffel
- balbi-bar
- green-table
- foyer-cafe
- fantuv-sal
- meat-beer
- hotel-buchlov
- barley-pub-gallery
- centrum-horec
- garbe-holesovice
- hotel-chateau-de-frontiere-hranicni-zamecek
- kino-pilotu
- knizeci-cesta
- autentista-wine-champagne-bar
- hotel-petrovy-kameny
- narodni-kavarna
- hotel-medlov
- hotel-carol
- story-of-prague
- umelecka-zahrada-a-atelier-v-nuslich
- wellness-restaurant-u-fandy
- designovy-event-space
- odonata-salounova-vila
- v-mejte
- vevaspace
- chata-hradecanka
- permonium
- fat-cat-underground
- the-design
- crowd-cafe
- cosmedix

## Notes

### Contact Information
Most venues from meatspace.cz don't have direct contact information in their listings. You may need to:
1. Visit the venue's own website (if provided)
2. Contact meatspace.cz for venue contact details
3. Research venues independently to find contact information

### Missing Data
Some fields that might need to be filled in after import:
- `priceRange` - Currently set to 'mid' by default
- `minimumSpend` - Not available from meatspace.cz
- `hourlyRate` - Not available from meatspace.cz
- `tags` - Empty array, should be populated based on venue type
- `features` - Empty array, could be populated from amenities
- `images` - Empty array, needs to be added separately
- `cancellationPolicy` - Not available from meatspace.cz

### Venue Images
The import script doesn't handle images. You'll need to:
1. Download images from meatspace.cz
2. Upload to Supabase storage
3. Update venue records with image URLs

### Duplicate Prevention
The script doesn't check for duplicates. Before running:
1. Check if any venues already exist in your database
2. Consider adding duplicate detection logic
3. Or manually verify no conflicts exist

## Customization

You can modify the import script to:
- Add custom tags based on venue type
- Map amenities to features
- Set different default values
- Add image processing
- Implement duplicate detection

## Troubleshooting

### Error: "Parent venue not found"
This means a child venue references a parent that wasn't created. Check:
1. The parentSlug value matches an existing parent's slug
2. Parent venues are in the JSON file
3. Parent venues were created successfully

### Error: "Unique constraint failed"
A venue with the same slug already exists. Either:
1. Delete the existing venue
2. Change the slug in the JSON
3. Skip that venue in the import

### Database Connection Error
Ensure your `.env.local` file has correct database credentials:
```
DATABASE_URL="your-database-connection-string"
```

## Next Steps

After importing:
1. Review all imported venues in Prisma Studio
2. Add missing contact information
3. Upload and attach images
4. Set appropriate tags and features
5. Adjust pricing information
6. Test venues on the frontend
7. Make venues featured/published as appropriate

## Support

For issues or questions:
- Check CLAUDE.md in the project root
- Review the Prisma schema
- Test with a small batch of venues first
