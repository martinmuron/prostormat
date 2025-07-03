import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET - Count venues matching criteria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const capacity = searchParams.get("capacity")
    const location = searchParams.get("location")
    const eventType = searchParams.get("type")

    // Build venue query criteria
    const whereClause: any = {
      status: "active", // Only active venues
    }

    // Filter by capacity if provided
    if (capacity) {
      const capacityNum = parseInt(capacity)
      whereClause.OR = [
        { capacitySeated: { gte: capacityNum } },
        { capacityStanding: { gte: capacityNum } }
      ]
    }

    // Filter by venue type based on event type
    if (eventType && eventType !== "jine") {
      const venueTypeMapping: { [key: string]: string[] } = {
        "firemni-akce": ["konferenční sál", "multifunkční prostor", "hotel"],
        "teambuilding": ["multifunkční prostor", "venkovní prostor", "sportovní zařízení"],
        "svatba": ["svatební sál", "hotel", "venkovní prostor", "historický prostor"],
        "narozeniny": ["restaurace", "bar", "multifunkční prostor"],
        "konference": ["konferenční sál", "multifunkční prostor", "hotel"],
        "workshop": ["školicí místnost", "multifunkční prostor", "coworking"]
      }

      const relevantTypes = venueTypeMapping[eventType]
      if (relevantTypes) {
        whereClause.venueType = { in: relevantTypes }
      }
    }

    // Filter by location if provided
    if (location) {
      whereClause.address = { contains: location.replace("praha-", "Praha ") }
    }

    // Count matching venues
    const count = await db.venue.count({
      where: whereClause
    })

    return NextResponse.json({ count })

  } catch (error) {
    console.error("Error counting venues:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 