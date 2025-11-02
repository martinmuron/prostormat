-- SQL queries to diagnose sitemap vs database mismatches
-- Run these against your production database (port 5432!)

-- ================================================
-- 1. Count venues by status
-- ================================================
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM prostormat_venues
GROUP BY status
ORDER BY count DESC;

-- ================================================
-- 2. Count venues that SHOULD be in sitemap
-- ================================================
SELECT COUNT(*) as "Should be in sitemap"
FROM prostormat_venues
WHERE status IN ('published', 'active')
  AND "parentId" IS NULL;

-- ================================================
-- 3. Find recently deleted/changed venues
-- ================================================
SELECT
  slug,
  name,
  status,
  "updatedAt",
  "createdAt"
FROM prostormat_venues
WHERE "updatedAt" > NOW() - INTERVAL '30 days'
  AND status NOT IN ('published', 'active')
ORDER BY "updatedAt" DESC
LIMIT 20;

-- ================================================
-- 4. Find venues with problematic slugs
-- ================================================
-- Empty slugs
SELECT id, name, slug, status
FROM prostormat_venues
WHERE slug IS NULL OR slug = '';

-- Duplicate slugs
SELECT
  slug,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as venue_names
FROM prostormat_venues
GROUP BY slug
HAVING COUNT(*) > 1;

-- ================================================
-- 5. Check specific venues from sitemap sample
-- Replace these slugs with ones from your sitemap
-- ================================================
SELECT
  slug,
  name,
  status,
  "parentId",
  "updatedAt"
FROM prostormat_venues
WHERE slug IN (
  'kaunicky-palace',
  'kotelna',
  'stodola-unetickeho-pivovaru'
);

-- ================================================
-- 6. Find venues with parent (shouldn't be in sitemap)
-- ================================================
SELECT
  v.slug,
  v.name,
  v.status,
  p.name as parent_name
FROM prostormat_venues v
JOIN prostormat_venues p ON v."parentId" = p.id
WHERE v.status IN ('published', 'active')
LIMIT 10;

-- ================================================
-- 7. Count total venues vs sitemap-eligible venues
-- ================================================
SELECT
  (SELECT COUNT(*) FROM prostormat_venues) as total_venues,
  (SELECT COUNT(*) FROM prostormat_venues WHERE status IN ('published', 'active') AND "parentId" IS NULL) as sitemap_eligible,
  (SELECT COUNT(*) FROM prostormat_venues WHERE status IN ('published', 'active') AND "parentId" IS NULL) - 388 as difference_from_sitemap;

-- ================================================
-- 8. Find venues that might have been renamed (slug changed)
-- ================================================
-- This finds venues with similar names but different slugs
SELECT
  slug,
  name,
  status,
  "updatedAt"
FROM prostormat_venues
WHERE name ILIKE '%kaunick%'
   OR name ILIKE '%palace%'
ORDER BY "updatedAt" DESC;
