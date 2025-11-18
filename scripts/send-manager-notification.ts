/**
 * Script to send manager assignment notification email
 *
 * Usage:
 *   npx tsx scripts/send-manager-notification.ts
 *
 * This will send a notification email to mark.muron@gmail.com about Medusa Prague
 */

import { prisma } from "../src/lib/prisma"
import { resend } from "../src/lib/resend"
import { randomUUID } from "crypto"

async function main() {
  const userId = "5d53a33c-c8cb-4910-bf20-23c3f9e5672c" // mark.muron@gmail.com
  const venueId = "cmgbaspxi0005nts29bvt4yt9" // Medusa Prague

  console.log("Fetching user and venue details...")

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
    console.error("❌ User or venue not found!")
    process.exit(1)
  }

  console.log(`📧 Sending notification to: ${user.email}`)
  console.log(`🏢 Venue: ${venue.name}`)

  // Send notification email
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

  if (!emailResult.data) {
    console.error("❌ Failed to send email:", emailResult.error)
    process.exit(1)
  }

  console.log(`✅ Email sent! ID: ${emailResult.data.id}`)

  // Log the email
  await prisma.emailFlowLog.create({
    data: {
      id: randomUUID(),
      emailType: "manager_assigned_notification",
      recipient: user.email,
      subject: `Byl jste přidán jako správce prostoru ${venue.name}`,
      status: "sent",
      recipientType: "venue_manager",
      sentBy: userId, // Self-assigned in this case
      resendEmailId: emailResult.data.id,
    },
  })

  console.log("✅ Email logged to EmailFlowLog")
  console.log("\n✨ Done! Check your email inbox.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
