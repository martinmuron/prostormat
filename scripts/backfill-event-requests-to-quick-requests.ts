import { config } from "dotenv"
import { resolve } from "path"
import { randomUUID } from "crypto"
import { prisma } from "../src/lib/prisma"
import { deriveGuestRangeFromNumber, findMatchingVenues } from "../src/lib/quick-request-utils"

config({ path: resolve(process.cwd(), ".env.local"), override: true })

async function main() {
  console.log("🔄 Backfilling Event Board requests into admin quick requests...")

  const eventRequests = await prisma.eventRequest.findMany({
    include: {
      broadcast: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  let linkedCount = 0
  let createdCount = 0
  let skippedNoVenues = 0

  for (const eventRequest of eventRequests) {
    if (eventRequest.broadcast) {
      continue
    }

    const existingBroadcast = await prisma.venueBroadcast.findFirst({
      where: {
        eventRequestId: eventRequest.id,
      },
    })

    if (existingBroadcast) {
      linkedCount++
      continue
    }

    const potentialMatch = await prisma.venueBroadcast.findFirst({
      where: {
        eventRequestId: null,
        contactEmail: eventRequest.contactEmail,
        contactName: eventRequest.contactName,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (potentialMatch && timeDifferenceInMinutes(potentialMatch.createdAt, eventRequest.createdAt) <= 10) {
      await prisma.venueBroadcast.update({
        where: { id: potentialMatch.id },
        data: { eventRequestId: eventRequest.id },
      })
      linkedCount++
      continue
    }

    const matchingVenues = await findMatchingVenues({
      guestCount: eventRequest.guestCount ?? null,
      locationPreference: eventRequest.locationPreference ?? null,
    })

    const guestRangeInfo = deriveGuestRangeFromNumber(eventRequest.guestCount ?? null)
    const guestLabel =
      guestRangeInfo.label ??
      (typeof eventRequest.guestCount === "number" && Number.isFinite(eventRequest.guestCount)
        ? `${eventRequest.guestCount} hostů`
        : null)

    const locationLabel =
      eventRequest.locationPreference === "Celá Praha"
        ? "Praha"
        : eventRequest.locationPreference?.trim() || null

    const broadcastTitleParts = [guestLabel, locationLabel].filter(Boolean)
    const broadcastTitle = broadcastTitleParts.length
      ? `Rychlá poptávka · ${broadcastTitleParts.join(" · ")}`
      : "Rychlá poptávka"

    const sentVenueIds = matchingVenues.map((venue) => venue.id)
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:")
    const sentVenuesValue = (
      isSqlite ? JSON.stringify(sentVenueIds) : sentVenueIds
    ) as unknown as string[]

    const broadcast = await prisma.venueBroadcast.create({
      data: {
        id: randomUUID(),
        userId: eventRequest.userId,
        eventRequestId: eventRequest.id,
        title: broadcastTitle,
        description:
          eventRequest.description?.trim() ||
          "Poptávka z Event Boardu (doplněno zpětně)",
        eventType: eventRequest.eventType,
        eventDate: eventRequest.eventDate,
        guestCount:
          typeof eventRequest.guestCount === "number" && Number.isFinite(eventRequest.guestCount)
            ? Math.max(1, Math.floor(eventRequest.guestCount))
            : 1,
        budgetRange: eventRequest.budgetRange || null,
        locationPreference: eventRequest.locationPreference,
        requirements: eventRequest.requirements || null,
        contactEmail: eventRequest.contactEmail,
        contactPhone: eventRequest.contactPhone || null,
        contactName: eventRequest.contactName,
        sentVenues: sentVenuesValue,
        status: "pending",
        sentCount: 0,
        createdAt: eventRequest.createdAt,
      },
    })

    if (matchingVenues.length > 0) {
      await prisma.venueBroadcastLog.createMany({
        data: matchingVenues.map((venue) => ({
          id: randomUUID(),
          broadcastId: broadcast.id,
          venueId: venue.id,
          emailStatus: "pending",
          sentAt: eventRequest.createdAt,
        })),
      })
      createdCount++
    } else {
      console.warn(
        "⚠️  No matching venues for event request, created broadcast without logs",
        eventRequest.id
      )
      skippedNoVenues++
    }
  }

  console.log("✅ Backfill completed:")
  console.log(`   • Linked existing broadcasts: ${linkedCount}`)
  console.log(`   • Created new quick requests: ${createdCount}`)
  console.log(`   • Requests without venue matches: ${skippedNoVenues}`)
}

main()
  .catch((error) => {
    console.error("❌ Backfill failed", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
const timeDifferenceInMinutes = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000
