import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

config({ path: '.env.local' })

const prisma = new PrismaClient()

interface CleanupRecord {
  id: string
  name: string
  oldAddress: string
  newAddress: string
  timestamp: string
}

async function cleanupVenueAddresses() {
  console.log('🧹 Starting venue address cleanup...\n')

  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      address: true
    }
  })

  console.log(`📊 Total venues: ${venues.length}`)

  const toUpdate: CleanupRecord[] = []

  // Identify venues needing updates
  for (const venue of venues) {
    if (!venue.address) continue

    let cleanedAddress = venue.address

    // Remove trailing comma/spaces
    cleanedAddress = cleanedAddress.replace(/,\s*$/, '')

    // Remove Praha/Prague patterns (including what follows them)
    // Pattern 1: ", Praha, <anything>" or ", Prague, <anything>"
    cleanedAddress = cleanedAddress.replace(/, (Praha|Prague),.*$/, '')
    // Pattern 2: ", Praha" or ", Prague" at end
    cleanedAddress = cleanedAddress.replace(/, (Praha|Prague)[^,]*$/, '')

    // Trim whitespace
    cleanedAddress = cleanedAddress.trim()

    // If address changed, record for update
    if (cleanedAddress !== venue.address && cleanedAddress.length > 0) {
      toUpdate.push({
        id: venue.id,
        name: venue.name,
        oldAddress: venue.address,
        newAddress: cleanedAddress,
        timestamp: new Date().toISOString()
      })
    }
  }

  console.log(`⚠️  Venues needing cleanup: ${toUpdate.length}\n`)

  if (toUpdate.length === 0) {
    console.log('✨ All addresses are already clean! No changes needed.\n')
    await prisma.$disconnect()
    return
  }

  // Show preview
  console.log('📝 PREVIEW OF CHANGES (first 5):\n')
  for (const record of toUpdate.slice(0, 5)) {
    console.log(`📍 ${record.name}`)
    console.log(`   Old: "${record.oldAddress}"`)
    console.log(`   New: "${record.newAddress}"`)
    console.log('')
  }

  if (toUpdate.length > 5) {
    console.log(`   ... and ${toUpdate.length - 5} more\n`)
  }

  console.log('\n⏳ Applying updates with transaction safety...\n')

  try {
    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      let updated = 0

      for (const record of toUpdate) {
        await tx.venue.update({
          where: { id: record.id },
          data: { address: record.newAddress }
        })
        updated++

        if (updated % 10 === 0) {
          console.log(`   ✓ Updated ${updated}/${toUpdate.length} venues...`)
        }
      }

      console.log(`   ✓ Updated ${updated}/${toUpdate.length} venues`)
    })

    console.log('\n✅ SUCCESS! All addresses cleaned up successfully.\n')

    // Save audit log
    const logPath = './address-cleanup-log.json'
    fs.writeFileSync(logPath, JSON.stringify(toUpdate, null, 2))
    console.log(`📁 Audit log saved to: ${logPath}\n`)

    // Summary
    console.log('📊 SUMMARY')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   Total updated: ${toUpdate.length}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)
    console.log('═══════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('\n❌ ERROR: Transaction failed and rolled back')
    console.error('No changes were applied to the database.')
    console.error('Error details:', error)
    throw error
  }

  await prisma.$disconnect()
}

cleanupVenueAddresses().catch(console.error)
