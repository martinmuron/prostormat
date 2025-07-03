import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Create and send venue broadcast
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      eventType,
      eventDate,
      guestCount,
      budgetRange,
      locationPreference,
      requirements,
      contactName,
      contactEmail,
      contactPhone
    } = body

    // Validate required fields
    if (!title || !description || !eventType || !contactName || !contactEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Build venue query criteria
    const whereClause: any = {
      status: "active", // Only active venues
    }

    // Filter by capacity if provided
    if (guestCount) {
      const capacity = parseInt(guestCount)
      whereClause.OR = [
        { capacitySeated: { gte: capacity } },
        { capacityStanding: { gte: capacity } }
      ]
    }

    // Filter by venue type based on event type
    if (eventType && eventType !== "jine") {
      const venueTypeMapping: { [key: string]: string[] } = {
        "firemni-akce": ["konferenční sál", "multifunkční prostor", "hotel"],
        "teambuilding": ["multifunkční prostor", "venkovní prostor", "sportovní zařízení"],
        "svatba": ["svatební sál", "hotel", "venkovní prostor", "historický prostor"],
        "narozeniny": ["restaurace", "bar", "multifunkční prostor"],
        "konference": ["konferenční sál", "multifunkční prostor", "hotel"],
        "workshop": ["školicí místnost", "multifunkční prostor", "coworking"]
      }

      const relevantTypes = venueTypeMapping[eventType]
      if (relevantTypes) {
        whereClause.venueType = { in: relevantTypes }
      }
    }

    // Filter by location if provided
    if (locationPreference) {
      whereClause.address = { contains: locationPreference.replace("praha-", "Praha ") }
    }

    // Find matching venues
    const matchingVenues = await db.venue.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    // Create the broadcast record
    const broadcast = await db.venueBroadcast.create({
      data: {
        userId: session.user.id,
        title,
        description,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        budgetRange,
        locationPreference,
        requirements,
        contactName,
        contactEmail,
        contactPhone,
        sentVenues: matchingVenues.map(v => v.id)
      }
    })

    // Create broadcast logs for each venue
    const broadcastLogs = await Promise.all(
      matchingVenues.map(venue =>
        db.venueBroadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "sent"
          }
        })
      )
    )

    // TODO: Here you would integrate with an email service to actually send emails
    // For now, we'll just log the emails that would be sent
    console.log(`Would send ${matchingVenues.length} emails for broadcast ${broadcast.id}`)
    
    // In a real implementation, you would:
    // 1. Format the email template with the broadcast data
    // 2. Send emails to each venue manager
    // 3. Update the emailStatus in VenueBroadcastLog based on delivery status
    
    return NextResponse.json({
      success: true,
      broadcastId: broadcast.id,
      venuesSent: matchingVenues.length,
      venues: matchingVenues.map(v => ({
        id: v.id,
        name: v.name,
        managerEmail: v.manager.email
      }))
    })

  } catch (error) {
    console.error("Error creating venue broadcast:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get user's venue broadcasts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [broadcasts, total] = await Promise.all([
      db.venueBroadcast.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: {
              sentVenues: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.venueBroadcast.count({
        where: { userId: session.user.id }
      })
    ])

    return NextResponse.json({
      broadcasts: broadcasts.map(b => ({
        ...b,
        venuesCount: b.sentVenues.length
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching venue broadcasts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 