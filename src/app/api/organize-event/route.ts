import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmailFromTemplate } from "@/lib/email-service"
import { trackOrganizaceSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"

const trackingSchema = z.object({
  eventId: z.string(),
  clientId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
}).optional()

const organizeEventSchema = z.object({
  name: z.string().min(2, "Jméno je povinné"),
  email: z.string().email("Neplatný email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().positive(),
  budgetRange: z.string().optional(),
  locationPreference: z.string().optional(),
  message: z.string().optional(),
})

const organizeEventPayloadSchema = organizeEventSchema.extend({
  tracking: trackingSchema,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = organizeEventPayloadSchema.parse(body)
    const { tracking, ...data } = parsed

    if (typeof data.guestCount !== 'number' || data.guestCount < 100) {
      return NextResponse.json({
        error: "Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.",
      }, { status: 400 })
    }

    try {
      // Send thank you email to user
      await sendEmailFromTemplate({
        templateKey: 'organize_event_thank_you',
        to: data.email,
        variables: {
          name: data.name,
          eventType: data.eventType || '',
          guestCount: data.guestCount?.toString() || '',
          eventDate: data.eventDate ? new Date(data.eventDate).toLocaleDateString('cs-CZ') : ''
        },
        tracking: {
          emailType: 'organize_event_thank_you',
          recipientType: 'user',
          sentBy: null,
        },
      })

      // Send notification email to admin
      await sendEmailFromTemplate({
        templateKey: 'organize_event_admin',
        to: 'info@prostormat.cz',
        variables: {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          company: data.company || '',
          eventType: data.eventType || '',
          guestCount: data.guestCount?.toString() || '',
          eventDate: data.eventDate ? new Date(data.eventDate).toLocaleDateString('cs-CZ') : 'Neuvedeno',
          budgetRange: data.budgetRange || '',
          locationPreference: data.locationPreference || '',
          message: data.message || ''
        },
        tracking: {
          emailType: 'organize_event_admin_notification',
          recipientType: 'admin',
          sentBy: null,
        },
      })

      // Track OrganizaceSubmit event in Meta (don't block on failure)
      try {
        const [firstName, ...lastNameParts] = data.name.split(' ')
        await trackOrganizaceSubmit({
          email: data.email,
          phone: data.phone,
          firstName: firstName,
          lastName: lastNameParts.join(' ') || undefined,
          fbp: tracking?.fbp,
          fbc: tracking?.fbc,
        }, {
          eventType: data.eventType,
          guestCount: data.guestCount,
          eventDate: data.eventDate,
          budgetRange: data.budgetRange,
          locationPreference: data.locationPreference,
          company: data.company,
        }, request, tracking?.eventId)
      } catch (metaError) {
        console.error('Failed to track Meta organizace submit event:', metaError)
        // Continue anyway - form submission was successful
      }

      // Track OrganizaceSubmit event in GA4 (don't block on failure)
      try {
        await trackGA4ServerLead({
          formType: 'organizace',
          eventType: data.eventType,
          guestCount: data.guestCount,
          location: data.locationPreference,
          budgetRange: data.budgetRange,
          email: data.email,
          clientId: tracking?.clientId,
          eventId: tracking?.eventId,
          request,
        })
      } catch (ga4Error) {
        console.error('Failed to track GA4 organizace submit event:', ga4Error)
        // Continue anyway - form submission was successful
      }

      return NextResponse.json({ success: true })
    } catch (emailErr) {
      console.error('Email sending error:', emailErr)
      return NextResponse.json({ error: "Chyba při odesílání emailu. Zkuste to prosím znovu." }, { status: 500 })
    }
  } catch (err) {
    console.error('Organize event route error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatná data", details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 })
  }
}
