import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const venueCount = await db.venue.count()
    const userCount = await db.user.count()
    
    const venues = await db.venue.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
      take: 5
    })

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      take: 3
    })

    return NextResponse.json({
      venueCount,
      userCount,
      sampleVenues: venues,
      sampleUsers: users,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({
      error: "Database error",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 