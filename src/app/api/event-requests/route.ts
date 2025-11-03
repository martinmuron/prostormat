import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { hasActiveVenueAccess } from "@/lib/venue-access"

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

export async function GET() {
  try {
    await db.eventRequest.updateMany({
      where: {
        status: "active",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "expired",
      },
    })

    let hasVenueAccess = false
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      hasVenueAccess = await hasActiveVenueAccess(session.user.id)
    }

    const requests = await db.eventRequest.findMany({
      where: {
        status: "active",
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

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
