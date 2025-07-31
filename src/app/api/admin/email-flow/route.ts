import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminPassword = request.headers.get("x-admin-password")
    if (adminPassword !== "112233") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500) // Max 500 records
    const offset = parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status") // Filter by status

    // Build where clause
    const whereClause: any = {}
    if (status && status !== "all") {
      whereClause.emailStatus = status
    }

    // Fetch venue broadcast logs with related data
    const venueBroadcastLogs = await db.venueBroadcastLog.findMany({
      where: whereClause,
      include: {
        broadcast: {
          select: {
            id: true,
            title: true,
            contactEmail: true,
            contactName: true,
            eventType: true
          }
        },
        venue: {
          select: {
            id: true,
            name: true,
            contactEmail: true
          }
        }
      },
      orderBy: {
        sentAt: "desc"
      },
      take: limit,
      skip: offset
    })

    // Transform to unified email flow format
    const emailFlowEntries = venueBroadcastLogs.map(log => ({
      id: log.id,
      type: "venue-broadcast",
      recipient: log.venue.contactEmail || log.venue.name,
      recipientName: log.venue.name,
      subject: `Nová poptávka: ${log.broadcast.title}`,
      status: mapEmailStatus(log.emailStatus),
      error: log.emailError,
      sentAt: log.sentAt.toISOString(),
      deliveredAt: log.emailStatus === "sent" ? log.sentAt.toISOString() : undefined, // For now, assume sent = delivered
      metadata: {
        broadcastId: log.broadcastId,
        venueId: log.venueId,
        campaignName: log.broadcast.title,
        eventType: log.broadcast.eventType
      }
    }))

    return NextResponse.json(emailFlowEntries)

  } catch (error) {
    console.error("Error fetching email flow data:", error)
    return NextResponse.json(
      { error: "Failed to fetch email flow data" },
      { status: 500 }
    )
  }
}

// Map our current email statuses to the standard format
function mapEmailStatus(status: string): 'sent' | 'delivered' | 'failed' | 'pending' | 'bounced' {
  switch (status) {
    case 'sent':
      return 'delivered' // For now, treat sent as delivered
    case 'failed':
      return 'failed'
    case 'pending':
      return 'pending'
    case 'skipped':
      return 'failed' // Treat skipped as failed
    default:
      return 'pending'
  }
}