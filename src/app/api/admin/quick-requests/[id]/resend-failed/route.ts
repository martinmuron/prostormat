import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { randomUUID } from "crypto"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendQuickRequestEmailToVenue } from "@/lib/quick-request-email"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const broadcast = await prisma.venueBroadcast.findUnique({
    where: { id },
  })

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 })
  }

  // Only get logs with failed, bounced, or complained status
  const logs = await prisma.venueBroadcastLog.findMany({
    where: {
      broadcastId: id,
      emailStatus: {
        in: ["failed", "bounced", "complained"],
      },
    },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          district: true,
          contactEmail: true,
          capacityStanding: true,
          capacitySeated: true,
        },
      },
    },
  })

  if (logs.length === 0) {
    return NextResponse.json({ error: "No failed venues to resend" }, { status: 400 })
  }

  const successes: string[] = []
  const failures: { venueId: string; error: string }[] = []

  const RATE_LIMIT_DELAY_MS = 800
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  for (const log of logs) {
    if (!log.venue?.contactEmail) {
      failures.push({ venueId: log.venueId, error: "Missing contact email" })
      await prisma.venueBroadcastLog.update({
        where: { id: log.id },
        data: {
          emailStatus: "failed",
          emailError: "Missing contact email",
        },
      })
      continue
    }

    const quickRequestPayload = {
      title: broadcast.title,
      guestCount: broadcast.guestCount,
      eventDate: broadcast.eventDate,
      locationPreference: broadcast.locationPreference,
    }

    try {
      const { emailId, subject } = await sendQuickRequestEmailToVenue(
        {
          id: log.venue.id,
          name: log.venue.name,
          slug: log.venue.slug,
          contactEmail: log.venue.contactEmail,
        },
        id,
        quickRequestPayload
      )

      await prisma.venueBroadcastLog.update({
        where: { id: log.id },
        data: {
          emailStatus: "sent",
          resendEmailId: emailId,
          sentAt: new Date(),
          emailError: null, // Clear previous error
        },
      })

      await prisma.emailFlowLog.create({
        data: {
          id: randomUUID(),
          emailType: "quick_request_venue_notification",
          recipient: log.venue.contactEmail,
          subject,
          status: "sent",
          recipientType: "venue_owner",
          sentBy: session.user.id,
          resendEmailId: emailId,
        },
      })

      successes.push(log.venueId)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      failures.push({ venueId: log.venueId, error: message })

      await prisma.venueBroadcastLog.update({
        where: { id: log.id },
        data: {
          emailStatus: "failed",
          emailError: message,
        },
      })

      await prisma.emailFlowLog.create({
        data: {
          id: randomUUID(),
          emailType: "quick_request_venue_notification",
          recipient: log.venue?.contactEmail ?? "unknown",
          subject: generateQuickRequestVenueNotificationEmail({
            venueName: log.venue?.name ?? "Neznámý prostor",
            venueSlug: log.venue?.slug ?? "neznamy-prostor",
            broadcastId: id,
            quickRequest: quickRequestPayload,
          }).subject,
          status: "failed",
          error: message,
          recipientType: "venue_owner",
          sentBy: session.user.id,
          resendEmailId: null,
        },
      })
    } finally {
      await delay(RATE_LIMIT_DELAY_MS)
    }
  }

  const remaining = await prisma.venueBroadcastLog.count({
    where: { broadcastId: id, emailStatus: "pending" },
  })

  const updatedBroadcast = await prisma.venueBroadcast.update({
    where: { id },
    data: {
      sentCount: broadcast.sentCount + successes.length,
      lastSentAt: successes.length ? new Date() : broadcast.lastSentAt,
      status:
        remaining === 0
          ? "completed"
          : successes.length > 0
            ? "partial"
            : broadcast.status,
    },
    select: {
      status: true,
      sentCount: true,
      lastSentAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    sent: successes,
    failed: failures,
    remaining,
    broadcast: updatedBroadcast,
  })
}
