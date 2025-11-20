import { NextRequest, NextResponse } from "next/server"
import { sendEmailFromTemplate } from "@/lib/email-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { rateLimit, rateLimitConfigs, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute for contact form
  const rateLimitResult = rateLimit(request, "contact", rateLimitConfigs.form)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailové adresy" },
        { status: 400 }
      )
    }

    try {
      const session = await getServerSession(authOptions)

      // Send thank you email to the user
      await sendEmailFromTemplate({
        templateKey: 'contact_form_thank_you',
        to: email,
        variables: {
          name,
          subject
        },
        tracking: {
          emailType: 'contact_form_thank_you',
          recipientType: 'user',
          sentBy: session?.user?.id ?? null,
        },
      })

      // Send notification email to admin (info@prostormat.cz)
      await sendEmailFromTemplate({
        templateKey: 'contact_form_admin',
        to: 'info@prostormat.cz',
        variables: {
          name,
          email,
          subject,
          message
        },
        tracking: {
          emailType: 'contact_form_admin_notification',
          recipientType: 'admin',
          sentBy: session?.user?.id ?? null,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Zpráva byla úspěšně odeslána. Děkujeme za váš zájem!"
      })

    } catch (emailError) {
      console.error('Error sending emails:', emailError)

      return NextResponse.json(
        { error: "Chyba při odesílání emailu. Zkuste to prosím znovu nebo nás kontaktujte přímo." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: "Chyba při zpracování formuláře" },
      { status: 500 }
    )
  }
}
