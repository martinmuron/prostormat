# Fully Automated Venue Categorization Plan

## Overview
Build and run a fully automated system that categorizes all 866 venues with multiple categories. No manual review required initially - you can adjust later through admin interface.

---

## Phase 1: Database & Schema Migration (30 min)

### 1.1 Update Prisma Schema
```prisma
model Venue {
  // Change from:
  venueType        String?

  // To:
  venueTypes       String[]  // Multiple categories
}
```

### 1.2 Database Migration
- Add `venueTypes` array field
- Copy existing `venueType` → `venueTypes[0]`
- Keep old field temporarily for safety

### 1.3 Update TypeScript Types
```typescript
// src/types/index.ts
export const VENUE_TYPES = {
  restaurant: 'Restaurace',
  bar: 'Bar',
  cafe: 'Kavárna',
  hotel: 'Hotel',
  conference: 'Konferenční centrum',
  gallery: 'Galerie',
  rooftop: 'Střešní terasa',
  historical: 'Historický prostor',
  palace: 'Palác',
  villa: 'Vila',
  garden: 'Zahrada',
  studio: 'Studio',
  loft: 'Loft',
  club: 'Klub',
  theater: 'Divadlo',
  museum: 'Muzeum',
  winery: 'Vinařství',
  other: 'Jiné'
}
```

---

## Phase 2: Frontend Updates (1-2 hours)

### 2.1 Components to Update
- `venue-card.tsx` - Display multiple category badges
- `venue-filters.tsx` - Filter by multiple categories (OR logic)
- `venue-form.tsx` - Multi-select category picker
- `prostory/[slug]/page.tsx` - Show all category badges
- `related-venues.tsx` - Match on any shared category

### 2.2 API Updates
- Update venue queries to use `venueTypes: { hasSome: [category] }`
- Update filters to match ANY category in array

---

## Phase 3: Intelligent Auto-Categorization Engine (2-3 hours)

### 3.1 Multi-Layer Categorization Logic

**Layer 1: Name-Based Rules (Highest Confidence)**
```typescript
Keywords to check in venue name:
- "restaurant", "restaurace", "bistro" → restaurant
- "hotel" → hotel
- "bar", "pub" → bar
- "café", "kavárna", "coffee" → cafe
- "galerie", "gallery" → gallery
- "palác", "palace" → palace
- "vila", "villa" → villa
- "roof", "střecha", "terrace" → rooftop
- "zahrada", "garden" → garden
- "studio" → studio
- "loft" → loft
- "club", "klub" → club
- "divadlo", "theater", "theatre" → theater
- "muzeum", "museum" → museum
- "wine", "víno", "vinařství" → winery
- "congress", "conference", "konference" → conference
```

**Layer 2: Description Analysis**
```typescript
Check description for keywords:
- Food/dining: "menu", "cuisine", "dining", "food", "jídlo"
- Drinks: "cocktails", "wine", "beer", "drinks", "nápoje"
- Events: "conference", "meeting", "konference", "schůzka"
- Art: "exhibition", "výstava", "art", "umění"
- History: "historical", "historický", "century", "století"
- Outdoor: "terrace", "garden", "outdoor", "venkovní"
```

**Layer 3: Capacity-Based Inference**
```typescript
if (capacity > 300) {
  suggest: conference (likely has large meeting spaces)
}
if (capacity > 150) {
  suggest: hotel OR conference (medium-large venue)
}
if (capacity < 30) {
  likely: intimate venue (restaurant, cafe, bar, studio)
}
```

**Layer 4: Website Content Analysis** (if websiteUrl exists)
```typescript
Fetch website homepage
Look for keywords:
- "menu", "reservation", "steak" → restaurant
- "cocktails", "bar menu" → bar
- "rooms", "accommodation", "book a room" → hotel
- "meeting rooms", "conference halls" → conference
- "exhibition", "gallery hours" → gallery
- "wedding", "svatba" → suitable for events
```

**Layer 5: Claude AI for Ambiguous Cases**
```typescript
For venues with low confidence (<70%):
- Send to Claude API with venue data
- Ask: "Based on this venue information, what categories fit best?"
- Parse structured response
- Use AI suggestions
```

### 3.2 Confidence Scoring
Each rule assigns a confidence score:
- Name match: 95% confidence
- Description match: 80% confidence
- Capacity inference: 60% confidence
- Website match: 85% confidence
- Claude API: 75% confidence

Assign category if confidence > 70%

### 3.3 Category Assignment Strategy
```typescript
Primary category: Highest confidence match
Secondary categories: Other matches > 70% confidence
Max 3 categories per venue (prevent over-categorization)

Special rules:
- Restaurant + large capacity → also add "conference"
- Hotel + meeting in description → also add "conference"
- Any venue + "roof" or "terrace" → also add "rooftop"
- Any venue + "historical" or old building → also add "historical"
```

---

## Phase 4: Build Categorization Script (1 hour)

### 4.1 Script Features
**Location:** `scripts/auto-categorize-venues.ts`

```typescript
Features:
- Processes all 866 venues
- Applies multi-layer logic
- Fetches websites (with rate limiting)
- Calls Claude API for ambiguous cases
- Generates confidence report
- Logs all decisions
- Dry-run mode to preview
- Saves results to database
```

### 4.2 Output Report
```
AUTOMATED CATEGORIZATION REPORT
================================
Total venues: 866
Successfully categorized: 850
Low confidence: 16

CONFIDENCE BREAKDOWN:
High (>90%): 720 venues
Medium (70-90%): 130 venues
Low (<70%): 16 venues

CATEGORY DISTRIBUTION:
Restaurant: 245
Bar: 78
Hotel: 34
Conference: 189
Gallery: 45
...

SAMPLES:
✓ Alma Prague → [bar, restaurant] (95% confidence)
✓ Hard Rock Cafe Praha → [restaurant, bar] (90% confidence)
✓ Hotel U Prince → [hotel, conference] (92% confidence)
⚠ Venue XYZ → [other] (45% confidence - needs review)
```

---

## Phase 5: Admin Interface for Future Edits (1 hour)

### 5.1 Build Admin Venue Editor
**Location:** `/admin/venues/[id]/edit`

**Features:**
- Multi-select dropdown for categories
- Show current categories
- Easy add/remove categories
- Save changes
- Bulk edit option for future

### 5.2 Bulk Category Manager
**Location:** `/admin/categorize-venues` (for your future use)

**Features:**
- List all venues with current categories
- Filter by category
- Search venues
- Quick edit categories
- Bulk select and update

---

## Phase 6: Testing & Deployment (1 hour)

### 6.1 Test Categorization
- Run script in dry-run mode
- Review sample outputs
- Check confidence scores
- Verify logic is working

### 6.2 Deploy
1. ✅ Run database migration
2. ✅ Deploy frontend updates
3. ✅ Run categorization script on production
4. ✅ Generate and review report
5. ✅ Monitor for issues

---

## Implementation Timeline

| Task | Time | Automated |
|------|------|-----------|
| Database migration | 30 min | Yes |
| Frontend updates | 1-2 hours | Yes |
| Categorization engine | 2-3 hours | Yes |
| Run categorization | 30-60 min | Yes |
| Admin interface | 1 hour | Yes |
| Testing | 30 min | Yes |
| **TOTAL** | **6-8 hours** | 100% |

---

## Expected Results

### High Accuracy Categories (95%+ confidence)
- Restaurants with "restaurant" in name
- Hotels with "hotel" in name
- Bars with "bar" in name
- Galleries with "gallery" in name

### Medium Accuracy (80-90% confidence)
- Multi-purpose venues (restaurant + events)
- Hotels with conference facilities
- Bars with food service
- Historical buildings

### Lower Accuracy (70-80% confidence)
- Generic event spaces
- Multipurpose venues without clear identity
- Venues with minimal description

### Strategy for Low Confidence
- Keep existing category
- Add "other" as fallback
- Flag for your future review
- Don't guess wildly

---

## Rollback Plan

If something goes wrong:
1. Old `venueType` field still exists
2. Can revert frontend to use old field
3. Can re-run script with tweaked logic
4. Database migration is reversible

---

## Next Steps

**I will now:**
1. ✅ Update database schema (venueType → venueTypes)
2. ✅ Create migration script
3. ✅ Update all frontend components
4. ✅ Build intelligent categorization engine
5. ✅ Run categorization on all 866 venues
6. ✅ Generate confidence report for your review
7. ✅ Deploy to production

**You will:**
- Review the confidence report when ready
- Use admin interface to manually adjust any incorrect categories
- Add/remove categories as needed

---

## Shall I proceed with full implementation?

This will take approximately 6-8 hours of development time. The categorization script will run automatically and assign multiple categories to all venues based on intelligent analysis.
