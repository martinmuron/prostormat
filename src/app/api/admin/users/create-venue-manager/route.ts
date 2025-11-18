import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { resend } from '@/lib/resend'
import { randomUUID } from 'crypto'

const createManagerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  venueId: z.string().optional(),
  sendEmail: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { email, password, name, venueId, sendEmail } = createManagerSchema.parse(json)

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists', userId: existingUser.id },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? email.split('@')[0],
        role: 'venue_manager',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // If venueId is provided, assign the user as manager to the venue
    let venue = null
    if (venueId) {
      venue = await db.venue.update({
        where: { id: venueId },
        data: { managerId: user.id },
        select: {
          id: true,
          name: true,
          slug: true,
        }
      })
    }

    // Send welcome email with login credentials if requested
    if (sendEmail) {
      let emailStatus: 'sent' | 'failed' = 'sent'
      let resendEmailId: string | null = null
      let emailErrorMessage: string | null = null

      try {
        const emailResult = await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: email,
          replyTo: 'info@prostormat.cz',
          subject: 'Váš účet správce prostoru na Prostormat.cz',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Vítejte na Prostormat! 🎉</h1>

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                    Ahoj ${name || email.split('@')[0]},
                  </p>

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                    Byl vám vytvořen účet správce prostoru na <strong>Prostormat.cz</strong>.
                    ${venue ? `Nyní máte přístup ke správě prostoru <strong>${venue.name}</strong>.` : 'Nyní máte přístup k administraci vašich prostor.'}
                  </p>

                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                    <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Vaše přihlašovací údaje:</h2>
                    <p style="color: #4b5563; font-size: 16px; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="color: #4b5563; font-size: 16px; margin: 8px 0;"><strong>Heslo:</strong> ${password}</p>
                    <p style="color: #dc2626; font-size: 14px; margin: 12px 0 0 0;">
                      ⚠️ Doporučujeme po prvním přihlášení změnit heslo ve vašem profilu.
                    </p>
                  </div>

                  <div style="margin: 24px 0;">
                    <a href="https://prostormat.cz/prihlaseni"
                       style="display: block; background-color: #3b82f6; color: white; padding: 14px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
                      🔐 Přihlásit se nyní
                    </a>
                  </div>

                  ${venue ? `
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                    Po přihlášení budete přesměrováni do administrace, kde můžete:
                  </p>
                  <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                    <li>Upravovat informace o prostoru</li>
                    <li>Nahrávat nové fotografie a videa</li>
                    <li>Spravovat rezervace a dotazy</li>
                    <li>Sledovat statistiky návštěvnosti</li>
                  </ul>
                  <div style="margin: 24px 0;">
                    <a href="https://prostormat.cz/prostory/${venue.slug}"
                       style="display: inline-block; background-color: white; color: #3b82f6; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 2px solid #3b82f6;">
                      📍 Zobrazit váš prostor
                    </a>
                  </div>
                  ` : ''}

                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                    Pokud máte jakékoliv dotazy nebo potřebujete pomoc, neváhejte nás kontaktovat na
                    <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a>
                  </p>

                  <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      <strong>S pozdravem,</strong><br>
                      Tým Prostormat<br>
                      <a href="https://prostormat.cz" style="color: #3b82f6;">prostormat.cz</a>
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })

        // Capture Resend email ID
        resendEmailId = emailResult.data?.id ?? null
      } catch (emailError) {
        emailStatus = 'failed'
        emailErrorMessage = emailError instanceof Error ? emailError.message : 'Unknown error sending email'
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the user creation if email fails
      }

      // Log the email send with actual status and Resend ID
      try {
        await db.emailFlowLog.create({
          data: {
            id: randomUUID(),
            emailType: 'venue_manager_created',
            recipient: email,
            subject: 'Váš účet správce prostoru na Prostormat.cz',
            status: emailStatus,
            error: emailErrorMessage,
            recipientType: 'venue_manager',
            sentBy: session.user.id,
            resendEmailId: resendEmailId,
          }
        })
      } catch (logError) {
        console.error('Failed to log email send:', logError)
      }
    }

    return NextResponse.json({
      user,
      venue,
      emailSent: sendEmail
    })
  } catch (error) {
    console.error('Error creating venue manager:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
