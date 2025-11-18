import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== "venue_manager" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20))
    const statusFilter = searchParams.get("status") || "all"

    const skip = (page - 1) * pageSize

    // Build where clause based on status filter
    const whereClause = statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}

    // Fetch regular inquiries
    const [regularInquiries, regularCount] = await Promise.all([
      prisma.venueInquiry.findMany({
        where: {
          venue: {
            managerId: session.user.id,
          },
          ...whereClause,
        },
        include: {
          venue: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.venueInquiry.count({
        where: {
          venue: {
            managerId: session.user.id,
          },
          ...whereClause,
        },
      }),
    ])

    // Fetch broadcast inquiries (quick requests)
    const [broadcastLogs, broadcastCount] = await Promise.all([
      prisma.venueBroadcastLog.findMany({
        where: {
          venue: {
            managerId: session.user.id,
          },
          emailStatus: "sent", // Only show successfully sent emails
          ...whereClause,
        },
        include: {
          venue: {
            select: {
              name: true,
              slug: true,
            },
          },
          broadcast: {
            select: {
              id: true,
              title: true,
              description: true,
              eventDate: true,
              guestCount: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true,
              createdAt: true,
            },
          },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.venueBroadcastLog.count({
        where: {
          venue: {
            managerId: session.user.id,
          },
          emailStatus: "sent",
          ...whereClause,
        },
      }),
    ])

    // Combine and format both types of inquiries
    const combinedInquiries = [
      ...regularInquiries.map(inq => ({
        id: inq.id,
        type: "inquiry" as const,
        name: inq.name,
        email: inq.email,
        phone: inq.phone,
        message: inq.message,
        eventDate: inq.eventDate,
        guestCount: inq.guestCount,
        status: inq.status,
        createdAt: inq.createdAt,
        venueName: inq.venue.name,
        venueSlug: inq.venue.slug,
      })),
      ...broadcastLogs.map(log => ({
        id: log.id,
        type: "broadcast" as const,
        name: log.broadcast.contactName,
        email: log.broadcast.contactEmail,
        phone: log.broadcast.contactPhone,
        message: log.broadcast.description,
        eventDate: log.broadcast.eventDate,
        guestCount: log.broadcast.guestCount,
        status: log.status,
        createdAt: log.sentAt,
        venueName: log.venue.name,
        venueSlug: log.venue.slug,
        broadcastId: log.broadcast.id,
        broadcastTitle: log.broadcast.title,
      })),
    ]

    // Sort by creation date
    combinedInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination to combined results
    const paginatedInquiries = combinedInquiries.slice(0, pageSize)
    const totalCount = regularCount + broadcastCount
    const totalPages = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      inquiries: paginatedInquiries,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching venue manager inquiries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
