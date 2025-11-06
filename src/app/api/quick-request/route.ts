import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { resend } from "@/lib/resend"
import { generateQuickRequestInternalNotificationEmail } from "@/lib/email-templates"
import { trackBulkFormSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"
import { getSafeSentByUserId } from "@/lib/email-helpers"
import { findMatchingVenues } from "@/lib/quick-request-utils"

const trackingSchema = z.object({
  eventId: z.string(),
  clientId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
}).optional()

const quickRequestSchema = z.object({
  eventDate: z.string()
    .min(1, "Event date is required")
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: "Invalid date format" }
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      },
      { message: "Event date must be today or in the future" }
    ),
  guestCount: z.string()
    .min(1, "Guest count is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 1 && num <= 9999
      },
      { message: "Guest count must be a number between 1 and 9999" }
    ),
  locationPreference: z.string().min(1, "Location preference is required"),
  requirements: z.string().optional(),
  message: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  eventType: z.string().optional(),
  budgetRange: z.string().optional(),
})

const payloadSchema = quickRequestSchema.extend({
  tracking: trackingSchema,
})

const QUICK_REQUEST_DEFAULT_EVENT_TYPE = 'rychla-poptavka' as const

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { tracking, ...validatedData } = payloadSchema.parse(body)

    // Find matching venues
    const matchingVenues = await findMatchingVenues({
      guestCount: validatedData.guestCount,
      locationPreference: validatedData.locationPreference,
    })

    if (matchingVenues.length === 0) {
      return NextResponse.json(
        { error: "Nenašli jsme žádné prostory odpovídající vašim kritériím" },
        { status: 404 }
      )
    }

    // Parse guest count - now accepts direct numbers (e.g., "40")
    // Zod validation ensures this is a valid number string, but we add defensive checks
    const parsed = parseInt(validatedData.guestCount, 10)
    const guestCountNumeric = !isNaN(parsed) && parsed > 0 ? parsed : 1
    const guestRangeLabel = guestCountNumeric > 0
      ? `${guestCountNumeric} hostů`
      : null
    const locationLabel =
      validatedData.locationPreference === "Celá Praha"
        ? "Praha"
        : validatedData.locationPreference || null
    const broadcastTitleParts = [guestRangeLabel, locationLabel].filter(Boolean)
    const broadcastTitle = broadcastTitleParts.length
      ? `Rychlá poptávka · ${broadcastTitleParts.join(" · ")}`
      : "Rychlá poptávka"

    const sentVenueIds = matchingVenues.map((venue) => venue.id)
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:")
    const sentVenuesValue = (
      isSqlite ? JSON.stringify(sentVenueIds) : sentVenueIds
    ) as unknown as string[]

    // Create a broadcast record and logs in a transaction to prevent orphaned records
    const broadcast = await db.$transaction(async (tx) => {
      const newBroadcast = await tx.venueBroadcast.create({
        data: {
          id: randomUUID(),
          userId: session?.user?.id || "anonymous", // Allow anonymous requests
          title: broadcastTitle,
          description: validatedData.message || "Rychlá poptávka prostoru",
          eventType: validatedData.eventType || QUICK_REQUEST_DEFAULT_EVENT_TYPE,
          eventDate: new Date(validatedData.eventDate),
          guestCount: guestCountNumeric, // Always a valid number after validation
          budgetRange: null,
          locationPreference: validatedData.locationPreference,
          requirements: validatedData.requirements || null,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone || null,
          contactName: validatedData.contactName,
          sentVenues: sentVenuesValue,
          status: "pending",
          sentCount: 0,
          updatedAt: new Date()
        }
      })

      await tx.venueBroadcastLog.createMany({
        data: matchingVenues.map((venue) => ({
          id: randomUUID(),
          broadcastId: newBroadcast.id,
          venueId: venue.id,
          emailStatus: "pending",
        })),
      })

      return newBroadcast
    })

    let eventRequestId: string | null = null

    try {
      const fallbackAdmin = session?.user?.id
        ? null
        : await db.user.findFirst({
            where: { role: "admin" },
            select: { id: true },
          })

      const eventRequestUserId = session?.user?.id ?? fallbackAdmin?.id

      if (eventRequestUserId) {
        const eventBoardTitleParts = [guestRangeLabel, locationLabel].filter(Boolean)
        const eventBoardTitle = eventBoardTitleParts.length
          ? `Rychlá poptávka: ${eventBoardTitleParts.join(" · ")}`
          : "Rychlá poptávka"

        const descriptionParts = [
          validatedData.message?.trim() || null,
          validatedData.requirements?.trim()
            ? `Požadavky: ${validatedData.requirements.trim()}`
            : null,
          "Tato poptávka vznikla přes formulář Rychlá poptávka a byla automaticky zveřejněna na Event Boardu.",
        ].filter(Boolean)

        const eventRequest = await db.eventRequest.create({
          data: {
            id: randomUUID(),
            userId: eventRequestUserId,
            title: eventBoardTitle,
            description: descriptionParts.join("\n\n"),
            eventType: validatedData.eventType || QUICK_REQUEST_DEFAULT_EVENT_TYPE,
            eventDate: new Date(validatedData.eventDate),
            guestCount: guestCountNumeric,
            budgetRange: null,
            locationPreference: validatedData.locationPreference || null,
            requirements: validatedData.requirements || null,
            contactName: validatedData.contactName,
            contactEmail: validatedData.contactEmail,
            contactPhone: validatedData.contactPhone || null,
            status: "active",
          },
        })

        eventRequestId = eventRequest.id

        try {
          await db.venueBroadcast.update({
            where: { id: broadcast.id },
            data: { eventRequestId: eventRequest.id },
          })
        } catch (linkError) {
          console.error("Failed to link quick request broadcast to event request:", linkError)
        }
      } else {
        console.warn(
          "[Quick Request] Unable to determine user for Event Board entry – no session or admin fallback found"
        )
      }
    } catch (eventBoardError) {
      console.error("Failed to create Event Board request from quick request:", eventBoardError)
    }

    const summaryEmail = generateQuickRequestInternalNotificationEmail({
      broadcastId: broadcast.id,
      quickRequest: {
        eventDate: validatedData.eventDate,
        guestCount: validatedData.guestCount,
        locationPreference: validatedData.locationPreference,
        requirements: validatedData.requirements,
        message: validatedData.message,
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
      },
      matchingVenues: matchingVenues.map((venue) => ({
        name: venue.name,
        district: venue.district,
        capacitySeated: venue.capacitySeated,
        capacityStanding: venue.capacityStanding,
      })),
    })

    // Send admin notification email with tracking
    const adminUserId = await getSafeSentByUserId(session?.user?.id)
    let adminEmailStatus: 'sent' | 'failed' = 'sent'
    let adminEmailError: string | null = null

    let adminEmailResendId: string | null = null

    try {
      const adminEmailResult = await resend.emails.send({
        from: 'Prostormat <info@prostormat.cz>',
        to: 'poptavka@prostormat.cz',
        subject: summaryEmail.subject,
        html: summaryEmail.html,
        text: summaryEmail.text,
      })
      adminEmailResendId = adminEmailResult.data?.id ?? null
    } catch (emailError) {
      adminEmailStatus = 'failed'
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('Failed to send quick request admin notification:', emailError)
    }

    // Track admin notification email
    if (adminUserId) {
      try {
        await db.emailFlowLog.create({
          data: {
            id: randomUUID(),
            emailType: 'quick_request_admin_notification',
            recipient: 'poptavka@prostormat.cz',
            subject: summaryEmail.subject,
            status: adminEmailStatus,
            error: adminEmailError,
            recipientType: 'admin',
            sentBy: adminUserId,
            resendEmailId: adminEmailResendId,
          },
        })
      } catch (logError) {
        console.error('Failed to log quick request admin email:', logError)
      }
    }

    // Track bulk form submission in Meta (don't block on failure)
    try {
      const [firstName, ...lastNameParts] = validatedData.contactName.split(' ')
      await trackBulkFormSubmit({
        email: validatedData.contactEmail,
        phone: validatedData.contactPhone,
        firstName: firstName,
        lastName: lastNameParts.join(' ') || undefined,
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
      }, {
        guestCount: guestCountNumeric ?? undefined,
        locationPreference: validatedData.locationPreference,
      }, request, tracking?.eventId)
    } catch (metaError) {
      console.error('Failed to track Meta bulk form submit event:', metaError)
      // Continue anyway - request was successful
    }

    // Track bulk form submission in GA4 (don't block on failure)
    try {
      await trackGA4ServerLead({
        userId: session?.user?.id,
        formType: 'bulk_request',
        guestCount: guestCountNumeric ?? undefined,
        location: validatedData.locationPreference,
        email: validatedData.contactEmail,
        clientId: tracking?.clientId,
        eventId: tracking?.eventId,
        request,
      })
    } catch (ga4Error) {
      console.error('Failed to track GA4 bulk form submit event:', ga4Error)
      // Continue anyway - request was successful
    }

    return NextResponse.json({
      success: true,
      broadcastId: broadcast.id,
      eventRequestId,
      pendingCount: matchingVenues.length,
      message: "Vaše poptávka byla předána týmu Prostormat. Po schválení ji odešleme relevantním prostorům."
    })

  } catch (error) {
    console.error("Error processing quick request:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při zpracování poptávky" },
      { status: 500 }
    )
  }
}
