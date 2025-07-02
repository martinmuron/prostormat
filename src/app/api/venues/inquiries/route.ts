import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const inquirySchema = z.object({
  venueId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  eventDate: z.string().optional().transform(val => val ? new Date(val) : null),
  guestCount: z.number().optional(),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const validatedData = inquirySchema.parse(body)

    // Check if venue exists
    const venue = await db.venue.findUnique({
      where: { id: validatedData.venueId },
      select: { id: true, name: true, contactEmail: true }
    })

    if (!venue) {
      return NextResponse.json(
        { error: "Prostor nebyl nalezen" },
        { status: 404 }
      )
    }

    // Create inquiry
    const inquiry = await db.venueInquiry.create({
      data: {
        venueId: validatedData.venueId,
        userId: session?.user?.id || null,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        eventDate: validatedData.eventDate,
        guestCount: validatedData.guestCount || null,
        message: validatedData.message,
      },
    })

    // TODO: Send email notification to venue manager
    // This would integrate with Resend or similar email service

    return NextResponse.json({ success: true, inquiryId: inquiry.id })
  } catch (error) {
    console.error("Error creating venue inquiry:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při odesílání dotazu" },
      { status: 500 }
    )
  }
}