import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"
import { trackLokaceSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { getSafeSentByUserId } from "@/lib/email-helpers"
import {
  generateVenueInquiryAdminNotificationEmail,
  generateVenueInquiryPaidNotificationEmail,
  generateVenueInquiryUnpaidNotificationEmail,
} from "@/lib/email-templates"

const trackingSchema = z.object({
  eventId: z.string(),
  clientId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
}).optional()

const inquirySchema = z.object({
  venueId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  eventDate: z.string().optional().transform(val => val ? new Date(val) : null),
  guestCount: z.number().optional(),
  message: z.string().min(10),
})

const inquiryPayloadSchema = inquirySchema.extend({
  tracking: trackingSchema,
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { tracking, ...validatedData } = inquiryPayloadSchema.parse(body)

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
        managerId: true,
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
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
      }, venue.name, request, tracking?.eventId)
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
        clientId: tracking?.clientId,
        eventId: tracking?.eventId,
        request,
      })
    } catch (ga4Error) {
      console.error('Failed to track GA4 lokace submit event:', ga4Error)
      // Continue anyway - inquiry was successful
    }

    // Notify internal team so they can verify venue status before forwarding
    const adminUserId = await getSafeSentByUserId(session?.user?.id)

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

      let adminEmailStatus: 'sent' | 'failed' = 'sent'
      let adminEmailError: string | null = null

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ["poptavka@prostormat.cz"],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
      } catch (sendError) {
        adminEmailStatus = 'failed'
        adminEmailError = sendError instanceof Error ? sendError.message : 'Unknown error'
        console.error("Failed to send venue inquiry notification email:", sendError)
      }

      // Track admin notification email
      if (adminUserId) {
        try {
          await db.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'venue_inquiry_admin_notification',
              recipient: 'poptavka@prostormat.cz',
              subject: emailContent.subject,
              status: adminEmailStatus,
              error: adminEmailError,
              recipientType: 'admin',
              sentBy: adminUserId,
            },
          })
        } catch (logError) {
          console.error("Failed to log admin notification email:", logError)
        }
      }
    } catch (emailError) {
      console.error("Failed to send venue inquiry notification email:", emailError)
    }

    // Send notification email directly to the venue
    try {
      if (!venue.contactEmail) {
        console.warn(`Venue ${venue.id} has no contactEmail - skipping notification`)
      } else {
        const emailContent = venue.paid
          ? generateVenueInquiryPaidNotificationEmail({
              inquiryId: inquiry.id,
              venueName: venue.name,
              venueSlug: venue.slug,
              eventDate: validatedData.eventDate,
              guestCount: validatedData.guestCount ?? null,
            })
          : generateVenueInquiryUnpaidNotificationEmail({
              inquiryId: inquiry.id,
              venueName: venue.name,
              venueSlug: venue.slug,
              eventDate: validatedData.eventDate,
              guestCount: validatedData.guestCount ?? null,
            })

        let emailStatus: "sent" | "failed" = "sent"
        let errorMessage: string | null = null

        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            replyTo: REPLY_TO_EMAIL,
            to: venue.contactEmail,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          })
        } catch (sendError) {
          emailStatus = "failed"
          errorMessage = sendError instanceof Error ? sendError.message : "Unknown email error"
          console.error("Failed to send venue notification email:", sendError)
        }

        const sentByUserId = await getSafeSentByUserId(session?.user?.id, venue.managerId ?? undefined)

        if (sentByUserId) {
          try {
            await db.emailFlowLog.create({
              data: {
                id: randomUUID(),
                emailType: venue.paid ? "venue_inquiry_paid" : "venue_inquiry_unpaid",
                recipient: venue.contactEmail,
                subject: emailContent.subject,
                status: emailStatus,
                error: errorMessage,
                recipientType: "venue_owner",
                sentBy: sentByUserId,
              },
            })
          } catch (logError) {
            console.error("Failed to log venue notification email:", logError)
          }
        }
      }
    } catch (emailError) {
      console.error("Failed to send venue notification email:", emailError)
      // Continue even if venue email fails
    }

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
