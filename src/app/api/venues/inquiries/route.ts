import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { trackLokaceSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"
import { resend, FROM_EMAIL } from "@/lib/resend"
import { generateVenueInquiryAdminNotificationEmail } from "@/lib/email-templates"

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
      select: {
        id: true,
        name: true,
        slug: true,
        paid: true,
        status: true,
        contactEmail: true,
      }
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
        id: randomUUID(),
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

    // Track LokaceSubmit event in Meta (don't block on failure)
    try {
      const [firstName, ...lastNameParts] = validatedData.name.split(' ')
      await trackLokaceSubmit({
        email: validatedData.email,
        phone: validatedData.phone,
        firstName: firstName,
        lastName: lastNameParts.join(' ') || undefined,
      }, venue.name, request)
    } catch (metaError) {
      console.error('Failed to track Meta lokace submit event:', metaError)
      // Continue anyway - inquiry was successful
    }

    // Track LokaceSubmit event in GA4 (don't block on failure)
    try {
      await trackGA4ServerLead({
        userId: session?.user?.id,
        formType: 'venue_inquiry',
        venueName: venue.name,
        venueId: venue.id,
        guestCount: validatedData.guestCount || undefined,
        email: validatedData.email,
        request,
      })
    } catch (ga4Error) {
      console.error('Failed to track GA4 lokace submit event:', ga4Error)
      // Continue anyway - inquiry was successful
    }

    // Notify internal team so they can verify venue status before forwarding
    try {
      const emailContent = generateVenueInquiryAdminNotificationEmail({
        inquiryId: inquiry.id,
        submittedAt: inquiry.createdAt,
        venue: {
          id: venue.id,
          name: venue.name,
          slug: venue.slug,
          paid: venue.paid ?? false,
          status: venue.status,
        },
        inquiry: {
          customerName: validatedData.name,
          customerEmail: validatedData.email,
          customerPhone: validatedData.phone,
          eventDate: validatedData.eventDate,
          guestCount: validatedData.guestCount || null,
          message: validatedData.message,
        },
      })

      await resend.emails.send({
        from: FROM_EMAIL,
        to: ["poptavka@prostormat.cz"],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
    } catch (emailError) {
      console.error("Failed to send venue inquiry notification email:", emailError)
    }

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
