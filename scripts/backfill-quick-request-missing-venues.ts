import { config } from "dotenv"
import { resolve } from "path"
import { randomUUID } from "crypto"
import { prisma } from "../src/lib/prisma"
import { findMatchingVenues } from "../src/lib/quick-request-utils"

config({ path: resolve(process.cwd(), ".env.local"), override: true })

interface BroadcastChange {
  broadcast: {
    id: string
    title: string
    guestCount: number | null
    locationPreference: string | null
    status: string
    sentVenues: unknown
  }
  currentVenueCount: number
  newVenueCount: number
  missingVenues: Array<{ id: string; name: string }>
  sentCount: number
}

async function analyzeQuickRequests(): Promise<BroadcastChange[]> {
  console.log("🔍 Analyzing all quick requests...\n")

  const broadcasts = await prisma.venueBroadcast.findMany({
    include: {
      logs: {
        select: {
          venueId: true,
          emailStatus: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const changes: BroadcastChange[] = []

  for (const broadcast of broadcasts) {
    const currentVenueIds = new Set(broadcast.logs.map((log) => log.venueId))
    const sentCount = broadcast.logs.filter(
      (log) => log.emailStatus === "sent" || log.emailStatus === "delivered"
    ).length

    // Re-run matching logic with current criteria
    const matchedVenues = await findMatchingVenues({
      guestCount: broadcast.guestCount,
      locationPreference: broadcast.locationPreference,
    })

    // Find venues that should be added
    const missingVenues = matchedVenues.filter((venue) => !currentVenueIds.has(venue.id))

    if (missingVenues.length > 0) {
      changes.push({
        broadcast: {
          id: broadcast.id,
          title: broadcast.title,
          guestCount: broadcast.guestCount,
          locationPreference: broadcast.locationPreference,
          status: broadcast.status,
          sentVenues: broadcast.sentVenues,
        },
        currentVenueCount: currentVenueIds.size,
        newVenueCount: matchedVenues.length,
        missingVenues: missingVenues.map((v) => ({ id: v.id, name: v.name })),
        sentCount,
      })
    }
  }

  return changes
}

function displayChanges(changes: BroadcastChange[]): void {
  console.log(`\n📊 ANALYSIS COMPLETE\n`)
  console.log(`Found ${changes.length} quick requests that need updating\n`)
  console.log("=" .repeat(80))

  let totalNewVenueLogs = 0

  for (const change of changes) {
    console.log(`\n📋 Quick Request: "${change.broadcast.title}"`)
    console.log(`   ID: ${change.broadcast.id}`)
    console.log(`   Current venues: ${change.currentVenueCount}`)
    console.log(`   Should have: ${change.newVenueCount} venues`)
    console.log(`   Missing: ${change.missingVenues.length} venues`)
    console.log(`   Status: ${change.broadcast.status}`)
    console.log(`   Already sent: ${change.sentCount} emails`)

    totalNewVenueLogs += change.missingVenues.length
  }

  console.log("\n" + "=".repeat(80))
  console.log(`\n📈 SUMMARY:`)
  console.log(`   • Quick requests to update: ${changes.length}`)
  console.log(`   • Total new venue logs to create: ${totalNewVenueLogs}`)
  console.log(`   • Existing sent emails will be preserved`)
  console.log(`   • New venues will be added with status "pending"\n`)
}

async function applyChanges(changes: BroadcastChange[]): Promise<void> {
  console.log("\n🚀 Applying changes...\n")

  let updated = 0
  let totalLogsCreated = 0

  for (const change of changes) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create new broadcast logs for missing venues
        await tx.venueBroadcastLog.createMany({
          data: change.missingVenues.map((venue) => ({
            id: randomUUID(),
            broadcastId: change.broadcast.id,
            venueId: venue.id,
            emailStatus: "pending",
          })),
        })

        // Get all current venue IDs from logs (including newly created)
        const allLogs = await tx.venueBroadcastLog.findMany({
          where: { broadcastId: change.broadcast.id },
          select: { venueId: true },
        })

        const allVenueIds = allLogs.map((log) => log.venueId)

        // Update sentVenues array
        const isSqlite = process.env.DATABASE_URL?.startsWith("file:")
        const sentVenuesValue = (isSqlite ? JSON.stringify(allVenueIds) : allVenueIds) as unknown as string[]

        // Update broadcast with new venue list
        await tx.venueBroadcast.update({
          where: { id: change.broadcast.id },
          data: {
            sentVenues: sentVenuesValue,
            updatedAt: new Date(),
          },
        })

        return { logsCreated: change.missingVenues.length }
      })

      updated++
      totalLogsCreated += result.logsCreated

      console.log(
        `✅ Updated "${change.broadcast.title.substring(0, 50)}..." (+${result.logsCreated} venues)`
      )
    } catch (error) {
      console.error(`❌ Failed to update broadcast ${change.broadcast.id}:`, error)
    }
  }

  console.log("\n" + "=".repeat(80))
  console.log(`\n✨ BACKFILL COMPLETE`)
  console.log(`   • Quick requests updated: ${updated}/${changes.length}`)
  console.log(`   • Total venue logs created: ${totalLogsCreated}`)
  console.log(`   • All new venues have status "pending"`)
  console.log(`   • Existing email statuses preserved\n`)
}

async function main() {
  console.log("🔄 Quick Request Venue Backfill Script\n")
  console.log("This script will:")
  console.log("  1. Re-run matching logic for all quick requests")
  console.log("  2. Find venues that should have been matched but weren't")
  console.log("  3. Add missing venues as 'pending' logs")
  console.log("  4. Preserve all existing email statuses (sent/failed/etc)\n")

  // Step 1: Analyze
  const changes = await analyzeQuickRequests()

  if (changes.length === 0) {
    console.log("\n✅ All quick requests are up to date! No changes needed.\n")
    return
  }

  // Step 2: Display preview
  displayChanges(changes)

  // Step 3: Confirm
  console.log("⚠️  This will modify the database. Make sure you have a backup!")
  console.log("\nDo you want to proceed with these changes? (y/n)")

  // For automated runs, you can set CONFIRM_BACKFILL=yes
  const autoConfirm = process.env.CONFIRM_BACKFILL === "yes"

  if (!autoConfirm) {
    console.log("\n💡 To run without confirmation, set CONFIRM_BACKFILL=yes")
    console.log("   Example: CONFIRM_BACKFILL=yes npm run backfill-venues\n")
    console.log("Waiting for manual confirmation in the code...")
    console.log("Update this script to proceed or run with CONFIRM_BACKFILL=yes\n")
    return
  }

  // Step 4: Apply changes
  await applyChanges(changes)
}

main()
  .catch((error) => {
    console.error("❌ Backfill failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
