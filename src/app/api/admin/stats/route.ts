import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Simple password check via header
    const adminPassword = request.headers.get("x-admin-password")
    
    if (adminPassword !== "112233") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get statistics
    const [
      totalUsers,
      totalVenues,
      activeVenues,
      draftVenues,
      totalInquiries,
      venueManagers
    ] = await Promise.all([
      db.user.count(),
      db.venue.count(),
      db.venue.count({ where: { status: "active" } }),
      db.venue.count({ where: { status: "draft" } }),
      db.venueInquiry.count(),
      db.user.count({ where: { role: "venue_manager" } })
    ])

    return NextResponse.json({
      totalUsers,
      totalVenues,
      activeVenues,
      draftVenues,
      totalInquiries,
      venueManagers
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 