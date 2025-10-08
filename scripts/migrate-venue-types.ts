import { db } from '../src/lib/db'

/**
 * Migration script to populate venueTypes array from existing venueType field
 * This is a one-time migration to move from single category to multiple categories
 */
async function migrateVenueTypes() {
  console.log('🚀 Starting venue type migration...\n')

  try {
    // Get all venues with a venueType set
    const venues = await db.venue.findMany({
      where: {
        venueType: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        venueType: true,
        venueTypes: true,
      }
    })

    console.log(`📊 Found ${venues.length} venues with venueType set\n`)

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const venue of venues) {
      try {
        // Skip if venueTypes already populated
        if (venue.venueTypes && venue.venueTypes.length > 0) {
          console.log(`⏭️  Skipping ${venue.name} - venueTypes already set`)
          skippedCount++
          continue
        }

        // Migrate venueType to venueTypes array
        if (venue.venueType) {
          await db.venue.update({
            where: { id: venue.id },
            data: {
              venueTypes: [venue.venueType]
            }
          })

          console.log(`✅ Migrated ${venue.name}: "${venue.venueType}" → ["${venue.venueType}"]`)
          migratedCount++
        }
      } catch (error) {
        console.error(`❌ Error migrating ${venue.name}:`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📈 Migration Summary:')
    console.log('='.repeat(60))
    console.log(`Total venues processed: ${venues.length}`)
    console.log(`✅ Successfully migrated: ${migratedCount}`)
    console.log(`⏭️  Skipped (already migrated): ${skippedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('='.repeat(60))

    if (errorCount === 0) {
      console.log('\n✨ Migration completed successfully!')
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review above.')
    }

  } catch (error) {
    console.error('❌ Fatal error during migration:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run migration
migrateVenueTypes()
