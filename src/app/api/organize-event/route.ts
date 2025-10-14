import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmailFromTemplate } from "@/lib/email-service"

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
        }
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
        }
      })

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
