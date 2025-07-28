import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

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
}) {
  const { min: minGuests, max: maxGuests } = parseGuestCount(criteria.guestCount)
  
  const venues = await db.venue.findMany({
    where: {
      status: "active",
      AND: [
        // Location matching - check if venue address contains the preferred location
        {
          address: {
            contains: criteria.locationPreference,
            mode: 'insensitive'
          }
        },
        // Capacity matching - venue should accommodate the guest count
        {
          OR: [
            // Check standing capacity
            {
              capacityStanding: {
                gte: minGuests,
                ...(maxGuests ? { lte: maxGuests * 1.2 } : {}) // Allow 20% over for standing
              }
            },
            // Check seated capacity
            {
              capacitySeated: {
                gte: minGuests,
                ...(maxGuests ? { lte: maxGuests } : {})
              }
            }
          ]
        }
      ]
    },
    include: {
      manager: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  })

  return venues
}

// Helper function to send email to venue (placeholder - you'll need to implement actual email sending)
async function sendEmailToVenue(venue: any, requestData: any) {
  // This is a placeholder - implement actual email sending logic
  // You might use services like SendGrid, AWS SES, or Nodemailer
  
  console.log(`Sending email to venue ${venue.name} (${venue.manager.email})`)
  console.log('Request data:', requestData)
  
  // For now, we'll just simulate success
  return { success: true }
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
      }
    })

    // Send emails to matching venues
    let successCount = 0
    const emailPromises = matchingVenues.map(async (venue) => {
      try {
        await sendEmailToVenue(venue, {
          ...validatedData,
          broadcastId: broadcast.id,
        })

        // Log the broadcast
        await db.venueBroadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "sent",
          }
        })

        successCount++
      } catch (error) {
        console.error(`Failed to send email to venue ${venue.id}:`, error)
        
        // Log the failed attempt
        await db.venueBroadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            venueId: venue.id,
            emailStatus: "failed",
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