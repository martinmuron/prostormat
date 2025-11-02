import { NextRequest, NextResponse } from "next/server"
import { sendEmailFromTemplate } from "@/lib/email-service"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSafeSentByUserId } from "@/lib/email-helpers"

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
      const session = await getServerSession(authOptions)
      const sentByUserId = await getSafeSentByUserId(session?.user?.id)

      // Send thank you email to the user
      let thankYouStatus: 'sent' | 'failed' = 'sent'
      let thankYouError: string | null = null

      try {
        await sendEmailFromTemplate({
          templateKey: 'contact_form_thank_you',
          to: email,
          variables: {
            name,
            subject
          }
        })
      } catch (error) {
        thankYouStatus = 'failed'
        thankYouError = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to send thank you email:', error)
      }

      // Track thank you email
      if (sentByUserId) {
        try {
          await db.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'contact_form_thank_you',
              recipient: email,
              subject: `Re: ${subject}`,
              status: thankYouStatus,
              error: thankYouError,
              recipientType: 'user',
              sentBy: sentByUserId,
            },
          })
        } catch (logError) {
          console.error('Failed to log thank you email:', logError)
        }
      }

      // Send notification email to admin (info@prostormat.cz)
      let adminStatus: 'sent' | 'failed' = 'sent'
      let adminError: string | null = null

      try {
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
      } catch (error) {
        adminStatus = 'failed'
        adminError = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to send admin notification email:', error)
      }

      // Track admin notification email
      if (sentByUserId) {
        try {
          await db.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'contact_form_admin_notification',
              recipient: 'info@prostormat.cz',
              subject: `Nový kontakt: ${subject}`,
              status: adminStatus,
              error: adminError,
              recipientType: 'admin',
              sentBy: sentByUserId,
            },
          })
        } catch (logError) {
          console.error('Failed to log admin notification email:', logError)
        }
      }

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