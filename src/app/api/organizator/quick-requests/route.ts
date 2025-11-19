import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== "organizer" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "upcoming"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10)

    const skip = (page - 1) * pageSize
    const now = new Date()

    // Build where clause based on event date filter
    const where: Prisma.VenueBroadcastWhereInput = {}
    if (filter === "upcoming") {
      where.OR = [
        { eventDate: { gte: now } },
        { eventDate: null }
      ]
    } else if (filter === "past") {
      where.eventDate = { lt: now }
    }

    // Get total count
    const totalCount = await db.venueBroadcast.count({ where })

    // Get quick requests (simplified for organizer - no logs/status)
    const quickRequests = await db.venueBroadcast.findMany({
      where,
      orderBy: { eventDate: "asc" },
      skip,
      take: pageSize,
    })

    // Format response - simplified without status/logs
    const formatted = quickRequests.map((request) => ({
      id: request.id,
      title: request.title,
      description: request.description,
      eventType: request.eventType,
      eventDate: request.eventDate?.toISOString() || null,
      guestCount: request.guestCount,
      budgetRange: request.budgetRange,
      locationPreference: request.locationPreference,
      requirements: request.requirements,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      createdAt: request.createdAt.toISOString(),
    }))

    return NextResponse.json({
      quickRequests: formatted,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page < Math.ceil(totalCount / pageSize),
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching quick requests for organizer:", error)
    return NextResponse.json(
      { error: "Failed to fetch quick requests" },
      { status: 500 }
    )
  }
}
