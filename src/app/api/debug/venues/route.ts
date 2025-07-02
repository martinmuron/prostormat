import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all venues
    const allVenues = await db.venue.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get featured venues (same query as homepage)
    const featuredVenues = await db.venue.findMany({
      where: {
        status: { in: ["active", "draft"] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      totalVenues: allVenues.length,
      allVenues,
      featuredVenues,
      featuredCount: featuredVenues.length,
    })
  } catch (error) {
    console.error("Error fetching venues:", error)
    return NextResponse.json(
      { error: "Failed to fetch venues", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}