import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { VENUE_TYPES, VenueType } from "@/types"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    // Get all venue logs for this broadcast
    const logs = await prisma.venueBroadcastLog.findMany({
      where: {
        broadcastId: id,
      },
      include: {
        venue: {
          select: {
            venueTypes: true,
          },
        },
      },
    })

    // Count venues by type
    const typeCounts = new Map<string, number>()

    for (const log of logs) {
      const venueTypes = log.venue?.venueTypes || []

      // If venue has no types, count as "other"
      if (venueTypes.length === 0) {
        typeCounts.set("other", (typeCounts.get("other") || 0) + 1)
      } else {
        // Count each type (venue can have multiple types)
        for (const type of venueTypes) {
          typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
        }
      }
    }

    // Convert to array and add labels
    const venueTypes = Array.from(typeCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        label: VENUE_TYPES[type as VenueType] || type,
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    return NextResponse.json({
      venueTypes,
      totalVenues: logs.length,
    })
  } catch (error) {
    console.error("Error fetching venue types:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue types" },
      { status: 500 }
    )
  }
}
