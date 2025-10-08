import { db } from '../src/lib/db'
import type { VenueType } from '../src/types'

/**
 * Intelligent Auto-Categorization Script
 * Analyzes venue names, descriptions, and metadata to assign multiple relevant categories
 */

interface CategorizationResult {
  venueId: string
  venueName: string
  suggestedCategories: string[]
  confidence: number
  reasoning: string[]
}

// Keywords for each category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  restaurant: [
    'restaurant', 'restaurace', 'bistro', 'dining', 'steak', 'grill', 'pizza',
    'trattoria', 'brasserie', 'eatery', 'kitchen', 'food', 'cuisine', 'menu'
  ],
  bar: [
    'bar', 'pub', 'tavern', 'cocktail', 'drink', 'lounge', 'wine bar'
  ],
  cafe: [
    'café', 'kavárna', 'coffee', 'coffeehouse', 'espresso', 'kafe'
  ],
  hotel: [
    'hotel', 'resort', 'inn', 'lodge', 'accommodation'
  ],
  conference: [
    'conference', 'konference', 'congress', 'kongres', 'meeting', 'business center',
    'konferenční', 'seminář', 'seminar', 'schůze', 'zasedání'
  ],
  gallery: [
    'gallery', 'galerie', 'art', 'exhibition', 'výstava', 'museum', 'muzeum'
  ],
  rooftop: [
    'rooftop', 'roof', 'terrace', 'terasa', 'střecha', 'střešní'
  ],
  palace: [
    'palace', 'palác', 'château', 'zámek', 'castle', 'hrad'
  ],
  villa: [
    'villa', 'vila', 'manor', 'estate', 'sídlo'
  ],
  garden: [
    'garden', 'zahrada', 'park', 'outdoor', 'venkovní', 'green'
  ],
  historical: [
    'historical', 'historický', 'heritage', 'century', 'století', 'historic',
    'baroque', 'baroko', 'renaissance', 'gothic', 'gothic'
  ],
  studio: [
    'studio', 'atelier', 'ateliér', 'workspace', 'creative space'
  ],
  loft: [
    'loft', 'industrial', 'warehouse', 'factory'
  ],
  club: [
    'club', 'klub', 'nightclub', 'dance', 'disco'
  ],
  theater: [
    'theater', 'theatre', 'divadlo', 'playhouse', 'stage'
  ],
  winery: [
    'winery', 'vina řství', 'vineyard', 'wine', 'víno', 'cellar', 'sklep'
  ]
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, ' ')
    .trim()
}

function analyzeVenue(venue: {
  id: string
  name: string
  description: string | null
  address: string
  capacitySeated: number | null
  capacityStanding: number | null
  websiteUrl: string | null
}): CategorizationResult {

  const categories: string[] = []
  const reasoning: string[] = []
  let totalConfidence = 0
  const categoryMatches: Map<string, number> = new Map()

  const nameNorm = normalizeText(venue.name)
  const descNorm = venue.description ? normalizeText(venue.description) : ''
  const combinedText = `${nameNorm} ${descNorm}`

  // Layer 1: Name-based analysis (highest confidence)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(keyword => {
      const keywordNorm = normalizeText(keyword)
      return nameNorm.includes(keywordNorm)
    })

    if (matches.length > 0) {
      const confidence = 95
      categoryMatches.set(category, confidence)
      reasoning.push(`Name contains "${matches[0]}" → ${category} (${confidence}% confidence)`)
    }
  }

  // Layer 2: Description-based analysis
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (categoryMatches.has(category)) continue // Already matched in name

    const matches = keywords.filter(keyword => {
      const keywordNorm = normalizeText(keyword)
      return descNorm.includes(keywordNorm)
    })

    if (matches.length > 0) {
      const confidence = 80
      categoryMatches.set(category, confidence)
      reasoning.push(`Description contains "${matches[0]}" → ${category} (${confidence}% confidence)`)
    }
  }

  // Layer 3: Capacity-based inference
  const totalCapacity = Math.max(venue.capacitySeated || 0, venue.capacityStanding || 0)

  if (totalCapacity > 200 && !categoryMatches.has('conference')) {
    const confidence = 70
    categoryMatches.set('conference', confidence)
    reasoning.push(`Large capacity (${totalCapacity}) → likely has conference facilities (${confidence}% confidence)`)
  }

  // Layer 4: Combined category logic
  // If it's a hotel with large capacity, add conference
  if (categoryMatches.has('hotel') && totalCapacity > 100 && !categoryMatches.has('conference')) {
    const confidence = 75
    categoryMatches.set('conference', confidence)
    reasoning.push(`Hotel + capacity ${totalCapacity} → conference facilities (${confidence}% confidence)`)
  }

  // If it has restaurant and serves drinks, might also be a bar
  if (categoryMatches.has('restaurant')) {
    const drinksKeywords = ['cocktails', 'drinks', 'bar', 'wine', 'beer', 'nápoje', 'koktejly']
    if (drinksKeywords.some(kw => combinedText.includes(normalizeText(kw)))) {
      if (!categoryMatches.has('bar')) {
        const confidence = 70
        categoryMatches.set('bar', confidence)
        reasoning.push(`Restaurant with drinks menu → also bar (${confidence}% confidence)`)
      }
    }
  }

  // Check for rooftop/terrace mentions
  const rooftopKeywords = ['roof', 'terrace', 'terasa', 'střecha']
  if (rooftopKeywords.some(kw => combinedText.includes(normalizeText(kw)))) {
    if (!categoryMatches.has('rooftop')) {
      const confidence = 85
      categoryMatches.set('rooftop', confidence)
      reasoning.push(`Mentions rooftop/terrace → rooftop venue (${confidence}% confidence)`)
    }
  }

  // Check for historical mentions
  const historicalKeywords = ['historical', 'historický', 'century', 'století', 'heritage', 'baroque', 'baroko']
  if (historicalKeywords.some(kw => combinedText.includes(normalizeText(kw)))) {
    if (!categoryMatches.has('historical')) {
      const confidence = 80
      categoryMatches.set('historical', confidence)
      reasoning.push(`Historical references → historical venue (${confidence}% confidence)`)
    }
  }

  // Sort by confidence and take top 3
  const sortedCategories = Array.from(categoryMatches.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  sortedCategories.forEach(([category, confidence]) => {
    categories.push(category)
    totalConfidence += confidence
  })

  // Calculate average confidence
  const avgConfidence = categories.length > 0 ? totalConfidence / categories.length : 0

  // If no categories matched, keep existing or add 'other'
  if (categories.length === 0) {
    categories.push('other')
    reasoning.push('No clear category match → defaulting to "other"')
  }

  return {
    venueId: venue.id,
    venueName: venue.name,
    suggestedCategories: categories,
    confidence: Math.round(avgConfidence),
    reasoning
  }
}

async function categorizeAllVenues() {
  console.log('🤖 Starting automated venue categorization...\n')

  try {
    // Get all venues
    const venues = await db.venue.findMany({
      where: {
        status: { in: ['published', 'active', 'hidden'] }
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        capacitySeated: true,
        capacityStanding: true,
        websiteUrl: true,
        venueTypes: true,
      }
    })

    console.log(`📊 Found ${venues.length} venues to categorize\n`)

    const results: CategorizationResult[] = []
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    const confidenceBreakdown = {
      high: 0,  // >85%
      medium: 0, // 70-85%
      low: 0     // <70%
    }

    const categoryDistribution: Record<string, number> = {}

    for (const venue of venues) {
      try {
        // Skip if already has categories (unless you want to re-categorize)
        if (venue.venueTypes && venue.venueTypes.length > 0) {
          console.log(`⏭️  Skipping ${venue.name} - already categorized`)
          skippedCount++
          continue
        }

        const result = analyzeVenue(venue)
        results.push(result)

        // Update database
        await db.venue.update({
          where: { id: venue.id },
          data: {
            venueTypes: result.suggestedCategories
          }
        })

        // Track statistics
        result.suggestedCategories.forEach(cat => {
          categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1
        })

        if (result.confidence > 85) confidenceBreakdown.high++
        else if (result.confidence >= 70) confidenceBreakdown.medium++
        else confidenceBreakdown.low++

        console.log(`✅ ${venue.name}`)
        console.log(`   Categories: ${result.suggestedCategories.join(', ')}`)
        console.log(`   Confidence: ${result.confidence}%`)
        result.reasoning.forEach(r => console.log(`   - ${r}`))
        console.log()

        updatedCount++

      } catch (error) {
        console.error(`❌ Error categorizing ${venue.name}:`, error)
        errorCount++
      }
    }

    // Print summary report
    console.log('\n' + '='.repeat(80))
    console.log('📈 CATEGORIZATION SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total venues: ${venues.length}`)
    console.log(`✅ Successfully categorized: ${updatedCount}`)
    console.log(`⏭️  Skipped (already categorized): ${skippedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log()

    console.log('📊 CONFIDENCE BREAKDOWN:')
    console.log(`  High (>85%): ${confidenceBreakdown.high} venues`)
    console.log(`  Medium (70-85%): ${confidenceBreakdown.medium} venues`)
    console.log(`  Low (<70%): ${confidenceBreakdown.low} venues`)
    console.log()

    console.log('🏷️  CATEGORY DISTRIBUTION:')
    Object.entries(categoryDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`)
      })
    console.log()

    if (confidenceBreakdown.low > 0) {
      console.log('⚠️  LOW CONFIDENCE VENUES (may need manual review):')
      results
        .filter(r => r.confidence < 70)
        .forEach(r => {
          console.log(`  - ${r.venueName} (${r.confidence}%): ${r.suggestedCategories.join(', ')}`)
        })
      console.log()
    }

    console.log('✨ Categorization completed successfully!')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Fatal error during categorization:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the categorization
categorizeAllVenues()
