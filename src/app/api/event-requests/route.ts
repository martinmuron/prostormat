import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { hasActiveVenueAccess } from "@/lib/venue-access"
import { deriveGuestRangeFromNumber, findMatchingVenues } from "@/lib/quick-request-utils"

const eventRequestSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  eventType: z.string().min(1),
  eventDate: z.string().optional().transform(val => val ? new Date(val) : null),
  guestCount: z.number().optional(),
  budgetRange: z.string().optional(),
  locationPreference: z.string().optional(),
  requirements: z.string().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const showPast = searchParams.get("showPast") === "true"

    let hasVenueAccess = false
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      hasVenueAccess = await hasActiveVenueAccess(session.user.id)
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const requests = await db.eventRequest.findMany({
      where: {
        status: "active",
        // Filter out past events unless showPast is true
        ...(!showPast && {
          OR: [
            { eventDate: { gte: startOfToday } },
            { eventDate: null }, // Include events without a date
          ],
        }),
      },
      orderBy: {
        // Sort by event date descending (furthest future first, counting down to today)
        eventDate: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          }
        },
        favorites: {
          select: {
            userId: true,
          }
        }
      }
    })

    return NextResponse.json({ requests, hasVenueAccess })
  } catch (error) {
    console.error("Error fetching event requests:", error)
    return NextResponse.json({ error: "Failed to fetch event requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = eventRequestSchema.parse(body)

    if (validatedData.eventDate) {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (validatedData.eventDate.getTime() < startOfToday.getTime()) {
        return NextResponse.json(
          { error: "Datum akce nemůže být v minulosti" },
          { status: 400 }
        )
      }
    }

    // Create event request
    const eventRequest = await db.eventRequest.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        eventType: validatedData.eventType,
        eventDate: validatedData.eventDate,
        guestCount: validatedData.guestCount || null,
        budgetRange: validatedData.budgetRange || null,
        locationPreference: validatedData.locationPreference || null,
        requirements: validatedData.requirements || null,
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone || null,
        status: "active",
      },
    })

    try {
      const locationPreferenceValue = validatedData.locationPreference?.trim() || null
      const matchingVenues = await findMatchingVenues({
        guestCount: validatedData.guestCount ?? null,
        locationPreference: locationPreferenceValue,
      })

      const guestRangeInfo = deriveGuestRangeFromNumber(validatedData.guestCount ?? null)
      const guestLabel =
        guestRangeInfo.label ??
        (typeof validatedData.guestCount === "number" && Number.isFinite(validatedData.guestCount)
          ? `${validatedData.guestCount} hostů`
          : null)

      const locationLabel =
        locationPreferenceValue === "Celá Praha"
          ? "Praha"
          : locationPreferenceValue

      const broadcastTitleParts = [guestLabel, locationLabel].filter(Boolean)
      const broadcastTitle = broadcastTitleParts.length
        ? `Rychlá poptávka · ${broadcastTitleParts.join(" · ")}`
        : "Rychlá poptávka"

      const sentVenueIds = matchingVenues.map((venue) => venue.id)
      const isSqlite = process.env.DATABASE_URL?.startsWith("file:")
      const sentVenuesValue = (
        isSqlite ? JSON.stringify(sentVenueIds) : sentVenueIds
      ) as unknown as string[]

      const broadcast = await db.venueBroadcast.create({
        data: {
          id: randomUUID(),
          userId: session.user.id,
          eventRequestId: eventRequest.id,
          title: broadcastTitle,
          description: validatedData.description || "Poptávka z Event Boardu",
          eventType: validatedData.eventType,
          eventDate: validatedData.eventDate,
          guestCount:
            typeof validatedData.guestCount === "number" && Number.isFinite(validatedData.guestCount)
              ? Math.max(1, Math.floor(validatedData.guestCount))
              : 1,
          budgetRange: validatedData.budgetRange || null,
          locationPreference: locationPreferenceValue,
          requirements: validatedData.requirements || null,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone || null,
          contactName: validatedData.contactName,
          sentVenues: sentVenuesValue,
          status: "pending",
          sentCount: 0,
        },
      })

      if (matchingVenues.length > 0) {
        await db.venueBroadcastLog.createMany({
          data: matchingVenues.map((venue) => ({
            id: randomUUID(),
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "pending",
          })),
        })
      } else {
        console.warn("[Event Request] No matching venues found for mirrored quick request", {
          eventRequestId: eventRequest.id,
          locationPreference: locationPreferenceValue,
          guestCount: validatedData.guestCount,
        })
      }
    } catch (quickRequestError) {
      console.error("Failed to create mirrored quick request for event request:", quickRequestError)
    }

    return NextResponse.json({ 
      success: true, 
      eventRequestId: eventRequest.id 
    })
  } catch (error) {
    console.error("Error creating event request:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při vytváření požadavku" },
      { status: 500 }
    )
  }
}
