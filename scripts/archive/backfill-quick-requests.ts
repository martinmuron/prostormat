/**
 * Backfill Quick Requests to Venue Broadcast Logs
 *
 * This script takes ALL quick requests (including past events) and creates
 * log entries for matching venues. This allows venue managers to see historical
 * inquiries when they first log in, without sending them notification emails.
 *
 * Usage:
 *   npx tsx scripts/backfill-quick-requests.ts
 */

import { prisma } from "../src/lib/prisma"

async function main() {
  console.log("🔍 Starting quick request backfill process...\n")

  const today = new Date("2025-11-18")
  today.setHours(0, 0, 0, 0)

  console.log(`📅 Backfilling only requests with event dates BEFORE: ${today.toLocaleDateString("cs-CZ")}\n`)

  // Fetch only quick requests where event date has already passed
  const broadcasts = await prisma.venueBroadcast.findMany({
    where: {
      eventDate: {
        lt: today, // Only past events
      },
    },
    select: {
      id: true,
      title: true,
      eventDate: true,
      guestCount: true,
      locationPreference: true,
      createdAt: true,
      logs: {
        select: {
          venueId: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  console.log(`📊 Found ${broadcasts.length} past quick requests to backfill\n`)

  let totalBackfilled = 0
  let totalSkipped = 0

  for (const broadcast of broadcasts) {
    const existingVenues = new Set(broadcast.logs.map(log => log.venueId))

    // Find matching venues based on location preference and capacity
    const matchingVenues = await prisma.venue.findMany({
      where: {
        status: "active",
        contactEmail: {
          not: null,
        },
        ...(broadcast.locationPreference && {
          address: {
            contains: broadcast.locationPreference,
            mode: "insensitive",
          },
        }),
        OR: [
          {
            capacityStanding: {
              gte: broadcast.guestCount || 0,
            },
          },
          {
            capacitySeated: {
              gte: broadcast.guestCount || 0,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Filter out venues that already have logs for this broadcast
    const newVenues = matchingVenues.filter(v => !existingVenues.has(v.id))

    if (newVenues.length === 0) {
      totalSkipped++
      continue
    }

    console.log(`📧 Broadcast: "${broadcast.title}" (${new Date(broadcast.eventDate || broadcast.createdAt).toLocaleDateString("cs-CZ")})`)
    console.log(`   → Adding to ${newVenues.length} venues: ${newVenues.map(v => v.name).join(", ")}`)

    // Create backfilled log entries
    await prisma.venueBroadcastLog.createMany({
      data: newVenues.map(venue => ({
        broadcastId: broadcast.id,
        venueId: venue.id,
        sentAt: broadcast.createdAt, // Use original broadcast creation date
        emailStatus: "backfilled", // Special status for historical data
        status: "new", // Manager hasn't responded yet
      })),
    })

    totalBackfilled += newVenues.length

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log("\n✅ Backfill complete!")
  console.log(`📊 Summary:`)
  console.log(`   - Total broadcasts processed: ${broadcasts.length}`)
  console.log(`   - Broadcasts with new venues: ${broadcasts.length - totalSkipped}`)
  console.log(`   - Broadcasts skipped (no new matches): ${totalSkipped}`)
  console.log(`   - Total log entries created: ${totalBackfilled}`)
}

main()
  .then(() => {
    console.log("\n✨ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error:", error)
    process.exit(1)
  })
