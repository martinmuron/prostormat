import { NextRequest, NextResponse } from "next/server"
import { sendEmailFromTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest) {
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
      // Send thank you email to the user
      await sendEmailFromTemplate({
        templateKey: 'contact_form_thank_you',
        to: email,
        variables: {
          name,
          subject
        }
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
        }
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