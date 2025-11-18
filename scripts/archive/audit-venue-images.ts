import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VenueImageAudit {
  id: string
  name: string
  slug: string
  images: string[]
  imageCount: number
  hasPlaceholders: boolean
  hasNoImages: boolean
  placeholderUrls: string[]
}

async function main() {
  console.log('🔍 AUDITING VENUE IMAGES ON LIVE DATABASE (PORT 5432)\n')
  console.log('⚠️  READ-ONLY OPERATION - NO DATA WILL BE MODIFIED\n')
  console.log('='.repeat(60))

  // Fetch all venues from live database
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      status: true
    }
  })

  console.log(`\n✅ Found ${venues.length} total venues in database\n`)

  const audit: VenueImageAudit[] = []
  const placeholderVenues: VenueImageAudit[] = []
  const noImageVenues: VenueImageAudit[] = []
  const validImageVenues: VenueImageAudit[] = []

  // Analyze each venue
  for (const venue of venues) {
    const images = venue.images || []
    const placeholderUrls = images.filter(img =>
      img.includes('unsplash.com') ||
      img.includes('placeholder') ||
      img.startsWith('http://') ||
      img.startsWith('https://')
    )

    const hasPlaceholders = placeholderUrls.length > 0
    const hasNoImages = images.length === 0

    const venueAudit: VenueImageAudit = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      images,
      imageCount: images.length,
      hasPlaceholders,
      hasNoImages,
      placeholderUrls
    }

    audit.push(venueAudit)

    if (hasPlaceholders) {
      placeholderVenues.push(venueAudit)
    } else if (hasNoImages) {
      noImageVenues.push(venueAudit)
    } else {
      validImageVenues.push(venueAudit)
    }
  }

  // REPORT: Venues with placeholder images
  console.log('\n📸 VENUES WITH PLACEHOLDER IMAGES (Unsplash/External URLs)\n')
  console.log('='.repeat(60))

  if (placeholderVenues.length === 0) {
    console.log('✅ No venues with placeholder images found!\n')
  } else {
    console.log(`Found ${placeholderVenues.length} venues with placeholders:\n`)
    placeholderVenues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`)
      console.log(`   Slug: ${venue.slug}`)
      console.log(`   Total images: ${venue.imageCount}`)
      console.log(`   Placeholder URLs:`)
      venue.placeholderUrls.forEach(url => {
        console.log(`     - ${url}`)
      })
      console.log()
    })
  }

  // REPORT: Venues with no images
  console.log('\n🚫 VENUES WITH NO IMAGES\n')
  console.log('='.repeat(60))

  if (noImageVenues.length === 0) {
    console.log('✅ No venues without images found!\n')
  } else {
    console.log(`Found ${noImageVenues.length} venues with no images:\n`)
    noImageVenues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`)
      console.log(`   Slug: ${venue.slug}`)
      console.log(`   Status: Empty image array`)
      console.log()
    })
  }

  // REPORT: Summary
  console.log('\n📊 SUMMARY\n')
  console.log('='.repeat(60))
  console.log(`Total venues in database: ${venues.length}`)
  console.log(`Venues with valid images: ${validImageVenues.length}`)
  console.log(`Venues with placeholder images: ${placeholderVenues.length}`)
  console.log(`Venues with no images: ${noImageVenues.length}`)
  console.log()

  // REPORT: Venues with valid images (for reference)
  console.log('\n✅ VENUES WITH VALID IMAGES (first 10)\n')
  console.log('='.repeat(60))
  validImageVenues.slice(0, 10).forEach((venue, index) => {
    console.log(`${index + 1}. ${venue.name} - ${venue.imageCount} images`)
    console.log(`   Slug: ${venue.slug}`)
    console.log(`   First image: ${venue.images[0] || 'N/A'}`)
    console.log()
  })

  console.log('\n' + '='.repeat(60))
  console.log('✅ AUDIT COMPLETE - NO DATA WAS MODIFIED')
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
