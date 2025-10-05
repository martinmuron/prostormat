import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all broadcast logs with tracking data
    const broadcastLogs = await db.venueBroadcastLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
      include: {
        broadcast: {
          select: {
            id: true,
            title: true,
            eventType: true,
            contactName: true,
            contactEmail: true,
            createdAt: true
          }
        },
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            contactEmail: true
          }
        }
      }
    })

    // Calculate overall stats
    const totalEmails = broadcastLogs.length
    const delivered = broadcastLogs.filter(log => log.emailDeliveredAt !== null).length
    const opened = broadcastLogs.filter(log => log.emailOpenedAt !== null).length
    const clicked = broadcastLogs.filter(log => log.emailClickedAt !== null).length
    const bounced = broadcastLogs.filter(log => log.emailBouncedAt !== null).length
    const complained = broadcastLogs.filter(log => log.emailComplainedAt !== null).length
    const totalOpens = broadcastLogs.reduce((sum, log) => sum + log.openCount, 0)
    const totalClicks = broadcastLogs.reduce((sum, log) => sum + log.clickCount, 0)

    const deliveryRate = totalEmails > 0 ? Math.round((delivered / totalEmails) * 100) : 0
    const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0
    const clickRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0
    const bounceRate = totalEmails > 0 ? Math.round((bounced / totalEmails) * 100) : 0
    const complaintRate = delivered > 0 ? Math.round((complained / delivered) * 100) : 0

    // Get unique broadcasts with their stats
    const broadcastStats = await db.venueBroadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        logs: {
          select: {
            id: true,
            emailStatus: true,
            emailDeliveredAt: true,
            emailOpenedAt: true,
            emailClickedAt: true,
            emailBouncedAt: true,
            emailComplainedAt: true,
            openCount: true,
            clickCount: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const broadcasts = broadcastStats.map(broadcast => {
      const total = broadcast.logs.length
      const delivered = broadcast.logs.filter(log => log.emailDeliveredAt).length
      const opened = broadcast.logs.filter(log => log.emailOpenedAt).length
      const clicked = broadcast.logs.filter(log => log.emailClickedAt).length
      const bounced = broadcast.logs.filter(log => log.emailBouncedAt).length

      return {
        id: broadcast.id,
        title: broadcast.title,
        eventType: broadcast.eventType,
        createdAt: broadcast.createdAt,
        sentBy: broadcast.user?.name || 'Unknown',
        totalSent: total,
        delivered,
        opened,
        clicked,
        bounced,
        totalOpens: broadcast.logs.reduce((sum, log) => sum + log.openCount, 0),
        totalClicks: broadcast.logs.reduce((sum, log) => sum + log.clickCount, 0),
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
      }
    })

    return NextResponse.json({
      stats: {
        totalEmails,
        delivered,
        opened,
        clicked,
        bounced,
        complained,
        totalOpens,
        totalClicks,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        complaintRate
      },
      broadcasts,
      recentLogs: broadcastLogs.slice(0, 50).map(log => ({
        id: log.id,
        broadcastTitle: log.broadcast.title,
        venueName: log.venue.name,
        venueEmail: log.venue.contactEmail,
        emailStatus: log.emailStatus,
        sentAt: log.sentAt,
        deliveredAt: log.emailDeliveredAt,
        openedAt: log.emailOpenedAt,
        clickedAt: log.emailClickedAt,
        bouncedAt: log.emailBouncedAt,
        complainedAt: log.emailComplainedAt,
        bounceType: log.bounceType,
        openCount: log.openCount,
        clickCount: log.clickCount,
        emailError: log.emailError
      }))
    })

  } catch (error) {
    console.error('Error fetching broadcast tracking:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
