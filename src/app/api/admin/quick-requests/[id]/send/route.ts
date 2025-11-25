import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { randomUUID } from "crypto"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendQuickRequestEmailToVenue } from "@/lib/quick-request-email"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

const sendSchema = z.object({
  venueId: z.string().optional(),
  venueIds: z.array(z.string()).optional(), // For AI-filtered venue list
  venueTypes: z.array(z.string()).optional(),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const json = await request.json().catch(() => ({}))
  const { venueId, venueIds, venueTypes } = sendSchema.parse(json)

  const broadcast = await prisma.venueBroadcast.findUnique({
    where: { id },
  })

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 })
  }

  const logs = await prisma.venueBroadcastLog.findMany({
    where: {
      broadcastId: id,
      // Allow resending to any venue if specific venueId is provided
      // Otherwise only send to pending
      ...(venueId ? { venueId } : { emailStatus: "pending" }),
      // Filter by venue IDs if provided (for AI-filtered list)
      ...(venueIds && venueIds.length > 0 && !venueId
        ? { venueId: { in: venueIds } }
        : {}),
      // Filter by venue types if provided
      ...(venueTypes && venueTypes.length > 0 && !venueId
        ? {
            venue: {
              venueType: {
                in: venueTypes,
              },
            },
          }
        : {}),
    },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          contactEmail: true,
          capacityStanding: true,
          capacitySeated: true,
          venueType: true,
        },
      },
    },
  })

  if (logs.length === 0) {
    return NextResponse.json({ error: "No pending venues to send" }, { status: 400 })
  }

  const successes: string[] = []
  const failures: { venueId: string; error: string }[] = []

  const RATE_LIMIT_DELAY_MS = 800
  const PROGRESS_UPDATE_BATCH_SIZE = 10 // Update sentCount every 10 emails
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  let batchSuccessCount = 0

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]

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
      batchSuccessCount++

      // Update sentCount incrementally every N emails for progress tracking
      if (batchSuccessCount >= PROGRESS_UPDATE_BATCH_SIZE || i === logs.length - 1) {
        await prisma.venueBroadcast.update({
          where: { id },
          data: {
            sentCount: { increment: batchSuccessCount },
            lastSentAt: new Date(),
          },
        })
        batchSuccessCount = 0
      }
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

  // Update final status (sentCount already updated incrementally during loop)
  const updatedBroadcast = await prisma.venueBroadcast.update({
    where: { id },
    data: {
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
