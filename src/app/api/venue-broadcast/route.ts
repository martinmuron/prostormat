import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      contactEmail,
      contactPhone,
      contactName
    } = body

    // Validate required fields
    if (!title || !description || !eventType || !contactEmail || !contactName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find matching venues based on criteria
    const matchingVenues = await db.venue.findMany({
      where: {
        status: 'active',
        // Add more matching criteria here based on location, capacity, etc.
        ...(locationPreference && {
          address: {
            contains: locationPreference,
            mode: 'insensitive'
          }
        }),
        ...(guestCount && {
          OR: [
            { capacitySeated: { gte: guestCount } },
            { capacityStanding: { gte: guestCount } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        managerId: true
      }
    })

    // Get venue IDs for the broadcast
    const venueIds = matchingVenues.map(venue => venue.id)

    // Create the broadcast
    const broadcast = await db.venueBroadcast.create({
      data: {
        userId: session.user.id,
        title,
        description,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        guestCount: guestCount || null,
        budgetRange,
        locationPreference,
        requirements,
        contactEmail,
        contactPhone,
        contactName,
        sentVenues: venueIds
      }
    })

    // Create broadcast logs for each venue
    const broadcastLogs = await Promise.all(
      matchingVenues.map(venue =>
        db.venueBroadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: 'sent'
          }
        })
      )
    )

    // TODO: Send emails to venues (implement email service later)
    // For now, we'll just log the matching venues
    console.log(`Broadcast created for ${matchingVenues.length} venues:`, matchingVenues.map(v => v.name))

    return NextResponse.json({
      success: true,
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        sentToVenues: matchingVenues.length
      }
    })

  } catch (error) {
    console.error('Error creating venue broadcast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [broadcasts, total] = await Promise.all([
      db.venueBroadcast.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          logs: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  contactEmail: true
                }
              }
            }
          }
        }
      }),
      db.venueBroadcast.count({
        where: { userId: session.user.id }
      })
    ])

    return NextResponse.json({
      broadcasts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching venue broadcasts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}