# Venue Multi-Category Migration Plan

## Overview
Migrate from single `venueType` (String) to multiple categories per venue (`venueTypes` String[]). Then systematically review and categorize all 866 venues based on their name, description, website, and capacity.

---

## Phase 1: Database & Schema Changes (30 min)

### 1.1 Update Prisma Schema
- Change `venueType` → `venueTypes` (String → String[])
- Keep backward compatibility during migration

### 1.2 Create Migration Script
- Add new `venueTypes` array field
- Copy existing `venueType` → `venueTypes` array
- Keep old field temporarily for rollback safety

### 1.3 Update TypeScript Types
- Update `src/types/index.ts`
- Change all references from `venueType` to `venueTypes`

---

## Phase 2: Frontend Updates (1-2 hours)

### 2.1 Update Components
- `venue-card.tsx` - Display multiple category badges
- `venue-filters.tsx` - Multi-select category filter
- `venue-form.tsx` - Multi-select category input
- `venue-gallery.tsx` - Show all categories
- `prostory/[slug]/page.tsx` - Display all categories

### 2.2 Update API Routes
- Update all venue queries to use `venueTypes`
- Update filters to match ANY category in array
- Update admin APIs

---

## Phase 3: Admin Categorization Interface (2-3 hours)

### 3.1 Create Bulk Categorization Tool
**Location:** `/admin/categorize-venues`

**Features:**
- Show venues one-by-one with:
  - Venue name
  - Current categories
  - Description (first 200 chars)
  - Website URL (clickable)
  - Capacity (seated/standing)
  - Address
- Multi-select checkboxes for categories
- "Auto-suggest" button that uses AI/rules to suggest categories
- Quick actions: Previous/Next/Skip/Save
- Progress indicator (e.g., "25/866 reviewed")
- Filter: Show only "uncategorized" or "needs review"

### 3.2 Auto-Categorization Rules
Create intelligent rules that pre-suggest categories:

**Rule-based categorization:**
```
IF name contains "restaurant" OR "restaurace" → suggest "restaurant"
IF name contains "bar" OR "pub" → suggest "bar"
IF name contains "hotel" → suggest "hotel"
IF name contains "galerie" OR "gallery" → suggest "gallery"
IF name contains "roof" OR "střecha" → suggest "rooftop"
IF name contains "palác" OR "palace" → suggest "palace"
IF name contains "vila" OR "villa" → suggest "villa"
IF name contains "zahrada" OR "garden" → suggest "garden"
IF name contains "studio" → suggest "studio"
IF name contains "loft" → suggest "loft"
IF name contains "conference" OR "konference" → suggest "conference"

IF capacity > 200 → suggest "conference" (likely has meeting space)
IF capacity < 50 → likely intimate venue
IF has "svatba" in description → suitable for weddings

Check website for keywords:
- "restaurant", "menu", "food" → restaurant
- "bar", "drinks", "cocktails" → bar
- "meeting rooms", "conference" → conference
- "gallery", "exhibition" → gallery
```

---

## Phase 4: Systematic Venue Review (8-10 hours with AI assistance)

### 4.1 Automated First Pass
Create script that:
1. Reads venue name, description, website
2. Applies rule-based categorization
3. Uses Claude API to suggest categories
4. Saves suggestions (doesn't auto-apply)

### 4.2 Manual Review Process
**Strategy: Work through venues systematically**

1. **Sort venues by confidence level:**
   - High confidence (name match) - Quick review
   - Medium confidence (description match) - Careful review
   - Low confidence (no clear indicators) - Manual research

2. **Review workflow:**
   - Review auto-suggestions
   - Visit website if unclear
   - Check capacity for appropriate categories
   - Assign 1-3 categories per venue (primary + secondary)
   - Save and move to next

3. **Batch by type:**
   - Process all obvious restaurants first (fast)
   - Then hotels, bars, galleries
   - Save hardest/unclear venues for last

### 4.3 Quality Checks
- No venue should have 0 categories
- Most venues should have 1-3 categories
- Conference rooms within hotels should have "hotel" + "conference"
- Restaurants with event space should have "restaurant" + maybe "conference"

---

## Phase 5: New Category Types

### 5.1 Expand VENUE_TYPES
Consider adding:
```typescript
- 'bar' (currently only 4 venues)
- 'cafe'
- 'club'
- 'theater'
- 'museum'
- 'winery'
- 'boat' (if you have river venues)
- 'unique' (for unusual spaces)
```

### 5.2 Create Category Hierarchy
**Primary categories** (shown prominently):
- Restaurant, Bar, Hotel, Conference Center, Gallery

**Secondary characteristics** (additional tags):
- Rooftop, Garden, Historical, Palace, Villa, Loft, Studio

---

## Phase 6: Testing & Deployment

### 6.1 Test Cases
- Venue with 1 category displays correctly
- Venue with 3 categories displays all badges
- Filters work with multiple categories
- Search by category returns correct venues
- Admin edit page saves multiple categories

### 6.2 Deploy Strategy
1. Deploy schema changes to production DB
2. Deploy frontend updates
3. Review & categorize in production admin panel
4. Monitor for issues

---

## Timeline Estimate

| Phase | Time Estimate | Can Automate? |
|-------|---------------|---------------|
| Phase 1: Database | 30 min | Yes |
| Phase 2: Frontend | 1-2 hours | Yes |
| Phase 3: Admin Tool | 2-3 hours | Yes |
| Phase 4: AI Auto-suggest | 1 hour | Yes |
| Phase 5: Manual Review | 6-8 hours | Partially |
| Phase 6: Testing | 1 hour | Yes |
| **TOTAL** | **11-15 hours** | ~50% automated |

---

## Proposed Automation Strategy

### Option A: Semi-Automated (Recommended)
1. Build admin tool with auto-suggestions
2. AI pre-categorizes all venues (saves suggestions)
3. You review each venue quickly, accept/modify suggestions
4. Estimated time: **3-4 hours of your time** + 4 hours dev work

### Option B: Fully Manual
1. Build admin tool
2. You categorize all 866 venues manually
3. Estimated time: **8-10 hours of your time** + 3 hours dev work

### Option C: Fully Automated (Risky)
1. AI categorizes everything automatically
2. You spot-check random samples
3. Risk: May have 10-20% errors
4. Estimated time: **1 hour your time** + 2 hours dev work

---

## Recommended Approach

**Best approach: Option A (Semi-Automated)**

1. **I build the system** (4-5 hours):
   - Database migration
   - Frontend updates
   - Admin categorization interface
   - AI auto-suggestion engine

2. **AI does first pass** (30 min automated):
   - Analyzes all 866 venues
   - Suggests categories based on rules + Claude API
   - Stores suggestions in database

3. **You review & approve** (3-4 hours):
   - Review AI suggestions in admin interface
   - Accept good suggestions (1 click)
   - Modify incorrect ones
   - Add missing categories
   - Visit websites when unclear

4. **Deploy to production** (30 min)

---

## Next Steps

**Should I proceed with:**
1. ✅ Option A: Semi-automated with AI suggestions + your review
2. Option B: Build tool, you do all categorization manually
3. Option C: Fully automated (risky)
4. Something else?

Once you confirm, I'll start with Phase 1 (database schema changes).
