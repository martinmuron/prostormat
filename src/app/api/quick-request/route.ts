import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { resend } from "@/lib/resend"
import { generateQuickRequestInternalNotificationEmail } from "@/lib/email-templates"
import { trackBulkFormSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"
import { EVENT_TYPES } from "@/types"
import { getSafeSentByUserId } from "@/lib/email-helpers"

const trackingSchema = z.object({
  eventId: z.string(),
  clientId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
}).optional()

const quickRequestSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  guestCount: z.string().min(1, "Guest count is required"),
  budgetRange: z.string().optional(),
  locationPreference: z.string().min(1, "Location preference is required"),
  requirements: z.string().optional(),
  message: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
})

const payloadSchema = quickRequestSchema.extend({
  tracking: trackingSchema,
})

type VenueMatch = {
  id: string
  name: string
  slug: string
  contactEmail: string | null
  capacityStanding: number | null
  capacitySeated: number | null
  district: string | null
  manager: {
    name: string | null
    email: string | null
  } | null
}

const QUICK_REQUEST_GUEST_LABELS: Record<string, string> = {
  "1-25": "1-25 hostů",
  "26-50": "26-50 hostů",
  "51-100": "51-100 hostů",
  "101-200": "101-200 hostů",
  "200+": "200+ hostů",
}

// Helper function to extract guest count range
function parseGuestCount(guestCountRange: string): { min: number; max: number | null } {
  const ranges: { [key: string]: { min: number; max: number | null } } = {
    "1-25": { min: 1, max: 25 },
    "26-50": { min: 26, max: 50 },
    "51-100": { min: 51, max: 100 },
    "101-200": { min: 101, max: 200 },
    "200+": { min: 200, max: null },
  }
  return ranges[guestCountRange] || { min: 0, max: null }
}

// Helper function to match venues based on criteria
async function findMatchingVenues(criteria: {
  guestCount: string
  locationPreference: string
  eventType: string
}): Promise<VenueMatch[]> {
  const { min: minGuests } = parseGuestCount(criteria.guestCount)

  const where: Prisma.VenueWhereInput = {
    status: 'active',
    contactEmail: { not: null },
  }

  const andConditions: Prisma.VenueWhereInput[] = []

  // Handle location preference
  if (criteria.locationPreference) {
    if (criteria.locationPreference === "Celá Praha") {
      // Match any Prague district (Praha 1-16)
      where.district = {
        startsWith: "Praha",
        mode: 'insensitive',
      }
    } else {
      // Use flexible matching for specific districts
      where.district = {
        contains: criteria.locationPreference,
        mode: 'insensitive',
      }
    }
  }

  if (minGuests > 0) {
    andConditions.push({
      OR: [
        { capacityStanding: { gte: minGuests } },
        { capacitySeated: { gte: minGuests } },
      ],
    })
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  const venues = await db.venue.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      contactEmail: true,
      capacityStanding: true,
      capacitySeated: true,
      district: true,
      manager: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  })

  console.log(`[Quick Request] Matched ${venues.length} venues for criteria:`, {
    location: criteria.locationPreference,
    minGuests,
    eventType: criteria.eventType
  })

  return venues.filter(venue => {
    const standing = venue.capacityStanding ?? 0
    const seated = venue.capacitySeated ?? 0
    const totalCapacity = standing + seated
    return totalCapacity >= minGuests
  })
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { tracking, ...validatedData } = payloadSchema.parse(body)

    // Find matching venues
    const matchingVenues = await findMatchingVenues({
      guestCount: validatedData.guestCount,
      locationPreference: validatedData.locationPreference,
      eventType: validatedData.eventType,
    })

    if (matchingVenues.length === 0) {
      return NextResponse.json(
        { error: "Nenašli jsme žádné prostory odpovídající vašim kritériím" },
        { status: 404 }
      )
    }

    const sentVenueIds = matchingVenues.map((venue) => venue.id)
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:")
    const sentVenuesValue = (
      isSqlite ? JSON.stringify(sentVenueIds) : sentVenueIds
    ) as unknown as string[]

    // Create a broadcast record to track this request
    const broadcast = await db.venueBroadcast.create({
      data: {
        id: randomUUID(),
        userId: session?.user?.id || "anonymous", // Allow anonymous requests
        title: `Rychlá poptávka - ${validatedData.eventType}`,
        description: validatedData.message || "Rychlá poptávka prostoru",
        eventType: validatedData.eventType,
        eventDate: new Date(validatedData.eventDate),
        guestCount: parseInt(validatedData.guestCount.split('-')[0]) || 1, // Take the lower bound
        budgetRange: validatedData.budgetRange || null,
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

    await db.venueBroadcastLog.createMany({
      data: matchingVenues.map((venue) => ({
        id: randomUUID(),
        broadcastId: broadcast.id,
        venueId: venue.id,
        emailStatus: "pending",
      })),
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
        const guestCountInfo = parseGuestCount(validatedData.guestCount)
        const guestCountNumeric = Number.isFinite(guestCountInfo.min) ? guestCountInfo.min : null
        const eventTypeLabel =
          EVENT_TYPES[validatedData.eventType as keyof typeof EVENT_TYPES] || validatedData.eventType
        const guestRangeLabel =
          QUICK_REQUEST_GUEST_LABELS[validatedData.guestCount] ||
          (guestCountNumeric ? `${guestCountNumeric}+ hostů` : "Neuvedeno")
        const locationLabel =
          validatedData.locationPreference === "Celá Praha"
            ? "Praha"
            : validatedData.locationPreference || "Bez lokality"

        const eventBoardTitle = `Rychlá poptávka: ${eventTypeLabel} · ${guestRangeLabel} · ${locationLabel}`

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
            eventType: validatedData.eventType,
            eventDate: new Date(validatedData.eventDate),
            guestCount: guestCountNumeric,
            budgetRange: validatedData.budgetRange || null,
            locationPreference: validatedData.locationPreference || null,
            requirements: validatedData.requirements || null,
            contactName: validatedData.contactName,
            contactEmail: validatedData.contactEmail,
            contactPhone: validatedData.contactPhone || null,
            status: "active",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        eventRequestId = eventRequest.id
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
        eventType: validatedData.eventType,
        eventDate: validatedData.eventDate,
        guestCount: validatedData.guestCount,
        budgetRange: validatedData.budgetRange,
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

    try {
      await resend.emails.send({
        from: 'Prostormat <info@prostormat.cz>',
        to: 'poptavka@prostormat.cz',
        subject: summaryEmail.subject,
        html: summaryEmail.html,
        text: summaryEmail.text,
      })
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
        eventType: validatedData.eventType,
        guestCount: typeof validatedData.guestCount === 'number' ? validatedData.guestCount : Number(validatedData.guestCount) || undefined,
        locationPreference: validatedData.locationPreference,
        budgetRange: validatedData.budgetRange,
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
        eventType: validatedData.eventType,
        guestCount: validatedData.guestCount,
        location: validatedData.locationPreference,
        budgetRange: validatedData.budgetRange,
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
