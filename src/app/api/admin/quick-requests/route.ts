import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const statusSchema = z.enum(["pending", "partial", "completed", "all"]).default("pending")
const timeFilterSchema = z.enum(["upcoming", "past", "all"]).default("all")

function normalizeSentVenues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value as string[]
  }

  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error("Failed to parse sentVenues string", error)
      return []
    }
  }

  return []
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get("status") ?? undefined
  const timeFilterParam = searchParams.get("timeFilter") ?? undefined
  const pageParam = searchParams.get("page")
  const pageSizeParam = searchParams.get("pageSize")

  const status = statusSchema.parse(statusParam)
  const timeFilter = timeFilterSchema.parse(timeFilterParam)
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = Math.min(Number(pageSizeParam) || 50, 100)
  const skip = (page - 1) * pageSize

  const now = new Date()

  // Build where clause with both status and time filters
  const whereClause: Prisma.VenueBroadcastWhereInput = {}

  if (status !== "all") {
    whereClause.status = status as "pending" | "partial" | "completed"
  }

  if (timeFilter === "upcoming") {
    whereClause.OR = [
      { eventDate: { gte: now } },
      { eventDate: null }
    ]
  } else if (timeFilter === "past") {
    whereClause.eventDate = { lt: now }
  }

  const [broadcasts, totalCount] = await Promise.all([
    prisma.venueBroadcast.findMany({
      where: whereClause,
      orderBy: { eventDate: "asc" },
      skip,
      take: pageSize,
      include: {
        logs: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                district: true,
                capacityStanding: true,
                capacitySeated: true,
                contactEmail: true,
                venueTypes: true,
              },
            },
          },
        },
      },
    }),
    prisma.venueBroadcast.count({ where: whereClause }),
  ])

  const payload = broadcasts.map((broadcast) => {
    const logs = broadcast.logs.map((log) => ({
      id: log.id,
      venueId: log.venueId,
      emailStatus: log.emailStatus,
      emailError: log.emailError,
      resendEmailId: log.resendEmailId,
      sentAt: log.sentAt,
      venue: log.venue,
    }))

    const totalVenues = logs.length
    const pendingCount = logs.filter((log) => log.emailStatus === "pending").length

    return {
      id: broadcast.id,
      title: broadcast.title,
      description: broadcast.description,
      eventType: broadcast.eventType,
      eventDate: broadcast.eventDate,
      guestCount: broadcast.guestCount,
      budgetRange: broadcast.budgetRange,
      locationPreference: broadcast.locationPreference,
      requirements: broadcast.requirements,
      contactName: broadcast.contactName,
      contactEmail: broadcast.contactEmail,
      contactPhone: broadcast.contactPhone,
      createdAt: broadcast.createdAt,
      status: broadcast.status,
      sentCount: broadcast.sentCount,
      lastSentAt: broadcast.lastSentAt,
      sentVenues: normalizeSentVenues(broadcast.sentVenues),
      totalVenues,
      pendingCount,
      logs,
    }
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  return NextResponse.json({
    quickRequests: payload,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  })
}
