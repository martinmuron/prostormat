import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { resend } from "@/lib/resend"
import { generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

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
type QuickRequestData = z.infer<typeof quickRequestSchema>

type VenueMatch = {
  id: string
  name: string
  slug: string
  contactEmail: string | null
  capacityStanding: number | null
  capacitySeated: number | null
  manager: {
    name: string | null
    email: string | null
  } | null
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

  if (criteria.locationPreference) {
    where.district = {
      equals: criteria.locationPreference,
      mode: 'insensitive',
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
      manager: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  })

  return venues.filter(venue => {
    const standing = venue.capacityStanding ?? 0
    const seated = venue.capacitySeated ?? 0
    const totalCapacity = standing + seated
    return totalCapacity >= minGuests
  })
}

// Helper function to send email to venue
async function sendEmailToVenue(
  venue: VenueMatch,
  requestData: QuickRequestData & { broadcastId: string }
) {
  if (!venue.contactEmail) {
    throw new Error(`Venue ${venue.name} has no contact email`)
  }

  // Parse guest count to get approximate number for email
  const guestCountRange = requestData.guestCount
  const guestCountApprox = guestCountRange ? parseInt(guestCountRange.split('-')[0], 10) : null
  const eventDate = new Date(requestData.eventDate)

  const emailContent = generateQuickRequestVenueNotificationEmail({
    venueName: venue.name,
    venueContactEmail: venue.contactEmail,
    quickRequest: {
      eventType: requestData.eventType,
      eventDate,
      guestCount: guestCountApprox ?? undefined,
      budgetRange: requestData.budgetRange || undefined,
      locationPreference: requestData.locationPreference,
      additionalInfo: requestData.requirements || requestData.message || undefined,
      contactName: requestData.contactName,
      contactEmail: requestData.contactEmail,
      contactPhone: requestData.contactPhone || undefined,
    }
  })

  // Send email via Resend
  const emailResult = await resend.emails.send({
    from: 'Prostormat <noreply@prostormat.cz>',
    to: venue.contactEmail,
    replyTo: 'info@prostormat.cz',
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  })

  if (!emailResult.data) {
    throw new Error(`Failed to send email to ${venue.contactEmail}`)
  }

  return {
    success: true,
    resendEmailId: emailResult.data.id
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = quickRequestSchema.parse(body)

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
        sentVenues: matchingVenues.map(v => v.id),
        updatedAt: new Date()
      }
    })

    // Send emails to matching venues
    let successCount = 0
    const emailPromises = matchingVenues.map(async (venue) => {
      try {
        const emailResult = await sendEmailToVenue(venue, {
          ...validatedData,
          broadcastId: broadcast.id,
        })

        // Log the broadcast in VenueBroadcastLog
        await db.venueBroadcastLog.create({
          data: {
            id: randomUUID(),
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "sent",
            resendEmailId: emailResult.resendEmailId || null,
          }
        })

        // Log in Email Flow system
        await db.emailFlowLog.create({
          data: {
            id: randomUUID(),
            emailType: 'quick_request_venue_notification',
            recipient: venue.contactEmail || 'unknown',
            subject: `Zákazník má zájem o váš prostor! - ${venue.name}`,
            status: 'sent',
            recipientType: 'venue_owner',
            sentBy: session?.user?.id || 'anonymous',
          }
        })

        successCount++
      } catch (error) {
        console.error(`Failed to send email to venue ${venue.id}:`, error)

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Log the failed attempt in VenueBroadcastLog
        await db.venueBroadcastLog.create({
          data: {
            id: randomUUID(),
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "failed",
            emailError: errorMessage,
          }
        })

        // Log failure in Email Flow system
        await db.emailFlowLog.create({
          data: {
            id: randomUUID(),
            emailType: 'quick_request_venue_notification',
            recipient: venue.contactEmail || 'unknown',
            subject: `Zákazník má zájem o váš prostor! - ${venue.name}`,
            status: 'failed',
            error: errorMessage,
            recipientType: 'venue_owner',
            sentBy: session?.user?.id || 'anonymous',
          }
        })
      }
    })

    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      broadcastId: broadcast.id,
      sentToCount: successCount,
      totalMatching: matchingVenues.length,
      message: `Vaše poptávka byla odeslána ${successCount} prostorům`
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