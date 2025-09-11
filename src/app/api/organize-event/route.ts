import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { generateOrganizeEventThankYouEmail, generateOrganizeEventAdminNotification } from "@/lib/email-templates"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = organizeEventSchema.parse(body)

    if (typeof data.guestCount !== 'number' || data.guestCount < 100) {
      return NextResponse.json({
        error: "Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 100+ osob.",
      }, { status: 400 })
    }

    const eventDate = data.eventDate ? new Date(data.eventDate) : null

    // Prepare emails
    const thankYou = generateOrganizeEventThankYouEmail({
      name: data.name,
      eventType: data.eventType,
      guestCount: data.guestCount,
      eventDate,
    })

    const admin = generateOrganizeEventAdminNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      eventType: data.eventType,
      eventDate,
      guestCount: data.guestCount,
      budgetRange: data.budgetRange,
      locationPreference: data.locationPreference,
      message: data.message,
    })

    try {
      // Send to user
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.email],
        replyTo: REPLY_TO_EMAIL,
        subject: thankYou.subject,
        html: thankYou.html,
        text: thankYou.text,
      })

      // Send to admin
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ["info@prostormat.cz"],
        replyTo: data.email,
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      })

      // Best-effort log to Email Flow (may require admin session; ignore failures)
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailType: 'organize_event_thank_you',
            recipient: data.email,
            subject: thankYou.subject,
            status: 'sent',
            sentBy: 'system',
            recipientType: 'organize_event_user'
          })
        })
      } catch (logErr) {
        console.error('Failed to log organize_event_thank_you:', logErr)
      }

      return NextResponse.json({ success: true })
    } catch (emailErr) {
      console.error('Resend error:', emailErr)

      // Attempt to log failure too
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailType: 'organize_event_thank_you',
            recipient: data.email,
            subject: thankYou.subject,
            status: 'failed',
            error: emailErr instanceof Error ? emailErr.message : 'Unknown error',
            sentBy: 'system',
            recipientType: 'organize_event_user'
          })
        })
      } catch {}

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

