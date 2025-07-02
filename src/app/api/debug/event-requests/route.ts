import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all event requests
    const allRequests = await db.eventRequest.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get active requests (same query as the page)
    const activeRequests = await db.eventRequest.findMany({
      where: {
        status: "active",
        expiresAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      totalRequests: allRequests.length,
      allRequests,
      activeRequests,
      activeCount: activeRequests.length,
      currentTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching event requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch event requests", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}