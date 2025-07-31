import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminPassword = request.headers.get("x-admin-password")
    if (adminPassword !== "112233") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Count all venue broadcast logs (our current email tracking)
    const totalEmails = await db.venueBroadcastLog.count()
    
    const sentEmails = await db.venueBroadcastLog.count({
      where: {
        emailStatus: "sent"
      }
    })

    // For now, we'll treat "sent" as delivered since we don't have delivery tracking yet
    const deliveredEmails = sentEmails

    const failedEmails = await db.venueBroadcastLog.count({
      where: {
        emailStatus: "failed"
      }
    })

    const pendingEmails = await db.venueBroadcastLog.count({
      where: {
        emailStatus: "pending"
      }
    })

    // Time-based counts
    const today_count = await db.venueBroadcastLog.count({
      where: {
        sentAt: {
          gte: today
        }
      }
    })

    const thisWeek = await db.venueBroadcastLog.count({
      where: {
        sentAt: {
          gte: weekAgo
        }
      }
    })

    const thisMonth = await db.venueBroadcastLog.count({
      where: {
        sentAt: {
          gte: monthAgo
        }
      }
    })

    const stats = {
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      pendingEmails,
      today: today_count,
      thisWeek,
      thisMonth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching email flow stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch email flow stats" },
      { status: 500 }
    )
  }
}