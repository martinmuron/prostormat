import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buildVenueWhereClause } from "@/lib/venue-filters"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const q = searchParams.get("q") || undefined
    const type = searchParams.get("type") || undefined
    const district = searchParams.get("district") || undefined
    const capacity = searchParams.get("capacity") || undefined

    const where = buildVenueWhereClause({ q, type, district, capacity })

    const count = await db.venue.count({ where })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting venues:", error)
    return NextResponse.json({ error: "Failed to count venues" }, { status: 500 })
  }
}
