import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { buildVenueWhereClause } from "@/lib/venue-filters"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const q = searchParams.get("q") || undefined
    const type = searchParams.get("type") || undefined
    const district = searchParams.get("district") || undefined
    const capacity = searchParams.get("capacity") || undefined
    const includeHiddenRequested = searchParams.get("includeHidden") === "true"
    const session = includeHiddenRequested ? await getServerSession(authOptions) : null
    const visibleStatuses =
      includeHiddenRequested && session?.user?.role === "admin"
        ? ['published', 'active', 'hidden']
        : ['published', 'active']

    const where = buildVenueWhereClause({ q, type, district, capacity, statuses: visibleStatuses, includeSubvenues: false })

    const count = await db.venue.count({ where })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting venues:", error)
    return NextResponse.json({ error: "Failed to count venues" }, { status: 500 })
  }
}
