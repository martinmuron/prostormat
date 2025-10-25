import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const statusSchema = z.enum(["pending", "partial", "completed", "all"]).default("pending")

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
  const takeParam = searchParams.get("take")

  const status = statusSchema.parse(statusParam)
  const take = takeParam ? Math.min(Number(takeParam) || 20, 100) : 20

  const broadcasts = await prisma.venueBroadcast.findMany({
    where: status === "all" ? undefined : { status },
    orderBy: { createdAt: "desc" },
    take,
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
            },
          },
        },
      },
    },
  })

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

  return NextResponse.json({ quickRequests: payload })
}
