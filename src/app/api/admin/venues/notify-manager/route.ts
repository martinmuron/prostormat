import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, venueId } = await request.json()

    if (!userId || !venueId) {
      return NextResponse.json({ error: "Missing userId or venueId" }, { status: 400 })
    }

    // Fetch user and venue details
    const [user, venue] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      }),
      prisma.venue.findUnique({
        where: { id: venueId },
        select: { id: true, name: true, slug: true },
      }),
    ])

    if (!user || !venue) {
      return NextResponse.json({ error: "User or venue not found" }, { status: 404 })
    }

    // Send notification email
    let emailStatus: 'sent' | 'failed' = 'sent'
    let resendEmailId: string | null = null
    let emailErrorMessage: string | null = null

    try {
      const emailResult = await resend.emails.send({
        from: "Prostormat <noreply@prostormat.cz>",
        to: user.email,
        replyTo: "info@prostormat.cz",
        subject: `Byl jste přidán jako správce prostoru ${venue.name}`,
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
                <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Nový prostor k správě! 🎉</h1>

                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                  Ahoj ${user.name || user.email.split("@")[0]},
                </p>

                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                  Byl jste přidán jako správce prostoru <strong>${venue.name}</strong> na platformě Prostormat.
                </p>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Prostor k správě:</h2>
                  <p style="color: #4b5563; font-size: 16px; margin: 8px 0;"><strong>${venue.name}</strong></p>
                </div>

                <div style="margin: 24px 0;">
                  <a href="https://prostormat.cz/prihlaseni"
                     style="display: block; background-color: #3b82f6; color: white; padding: 14px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
                    🔐 Přihlásit se do administrace
                  </a>
                </div>

                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                  Po přihlášení budete přesměrováni do administrace, kde můžete:
                </p>
                <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                  <li>Upravovat informace o prostoru</li>
                  <li>Nahrávat nové fotografie a videa</li>
                  <li>Spravovat poptávky od zákazníků</li>
                  <li>Sledovat statistiky návštěvnosti</li>
                </ul>

                <div style="margin: 24px 0;">
                  <a href="https://prostormat.cz/prostory/${venue.slug}"
                     style="display: inline-block; background-color: white; color: #3b82f6; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 2px solid #3b82f6;">
                    📍 Zobrazit prostor
                  </a>
                </div>

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
        `,
      })

      // Capture Resend email ID
      resendEmailId = emailResult.data?.id ?? null
    } catch (emailError) {
      emailStatus = 'failed'
      emailErrorMessage = emailError instanceof Error ? emailError.message : 'Unknown error sending email'
      console.error('Failed to send manager notification email:', emailError)
    }

    // Log the email with actual status and Resend ID
    try {
      await prisma.emailFlowLog.create({
        data: {
          id: randomUUID(),
          emailType: "manager_assigned_notification",
          recipient: user.email,
          subject: `Byl jste přidán jako správce prostoru ${venue.name}`,
          status: emailStatus,
          error: emailErrorMessage,
          recipientType: "venue_manager",
          sentBy: session.user.id,
          resendEmailId: resendEmailId,
        },
      })
    } catch (logError) {
      console.error('Failed to log email send:', logError)
    }

    // If email failed, return error
    if (emailStatus === 'failed') {
      return NextResponse.json({
        error: "Failed to send notification email",
        details: emailErrorMessage
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending manager notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
