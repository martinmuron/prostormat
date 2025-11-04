import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { resend, FROM_EMAIL } from "@/lib/resend"

const CRON_SECRET = process.env.CRON_SECRET
const DIGEST_RECIPIENT = "info@prostormat.cz"
const TIMEZONE = "Europe/Prague"

function isAuthorized(request: NextRequest): boolean {
  const cronHeader = request.headers.get("x-vercel-cron")
  if (cronHeader) {
    return true
  }

  if (!CRON_SECRET) {
    console.warn("CRON_SECRET is not configured; allowing request.")
    return true
  }

  const headerSecret = request.headers.get("x-cron-secret")
  const querySecret = request.nextUrl.searchParams.get("secret")

  return headerSecret === CRON_SECRET || querySecret === CRON_SECRET
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function renderDigestHtml(stats: { users: number; payingVenues: number; quickRequests: number }, generatedAt: Date) {
  const formattedDate = formatDate(generatedAt)
  const formattedTime = formatTime(generatedAt)

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 0.5rem;">Denní přehled Prostormat</h2>
      <p style="margin-top: 0; color: #6b7280;">Vygenerováno ${formattedDate} v ${formattedTime} (Europe/Prague)</p>

      <table style="border-collapse: collapse; margin-top: 1.5rem;">
        <tbody>
          <tr>
            <td style="padding: 0.5rem 1.5rem 0.5rem 0; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Celkový počet registrovaných uživatelů</td>
            <td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">${stats.users.toLocaleString("cs-CZ")}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 1.5rem 0.5rem 0; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Aktivní platící prostory</td>
            <td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">${stats.payingVenues.toLocaleString("cs-CZ")}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 1.5rem 0.5rem 0; font-weight: 600;">Počet rychlých poptávek</td>
            <td style="padding: 0.5rem 0;">${stats.quickRequests.toLocaleString("cs-CZ")}</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 2rem; color: #6b7280; font-size: 0.875rem;">
        Tento automatický e-mail byl odeslán z Prostormat aplikace.
      </p>
    </div>
  `
}

function renderDigestText(stats: { users: number; payingVenues: number; quickRequests: number }, generatedAt: Date) {
  const formattedDate = formatDate(generatedAt)
  const formattedTime = formatTime(generatedAt)

  return [
    `Denní přehled Prostormat`,
    `Vygenerováno ${formattedDate} v ${formattedTime} (Europe/Prague)`,
    ``,
    `Celkový počet registrovaných uživatelů: ${stats.users}`,
    `Aktivní platící prostory: ${stats.payingVenues}`,
    `Počet rychlých poptávek: ${stats.quickRequests}`,
    ``,
    `Tento automatický e-mail byl odeslán z Prostormat aplikace.`,
  ].join("\n")
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get admin user for logging system emails
    const adminUser = await db.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    })

    const [users, payingVenues, quickRequests] = await Promise.all([
      db.user.count(),
      db.venue.count({ where: { paid: true } }),
      db.venueBroadcast.count(),
    ])

    const stats = { users, payingVenues, quickRequests }
    const now = new Date()

    const html = renderDigestHtml(stats, now)
    const text = renderDigestText(stats, now)
    const subject = `Denní přehled Prostormat – ${formatDate(now)}`

    let emailStatus = 'failed'
    let emailError: string | null = null
    let resendEmailId: string | null = null

    try {
      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: DIGEST_RECIPIENT,
        subject,
        html,
        text,
      })

      if (emailResult.data?.id) {
        emailStatus = 'sent'
        resendEmailId = emailResult.data.id
      }
    } catch (sendError) {
      console.error("Failed to send daily digest email:", sendError)
      emailError = sendError instanceof Error ? sendError.message : "Unknown error"
      throw sendError
    } finally {
      // Track email send attempt in Email Flow system
      if (adminUser) {
        try {
          await db.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'daily_digest',
              recipient: DIGEST_RECIPIENT,
              subject,
              status: emailStatus,
              error: emailError,
              recipientType: 'admin',
              sentBy: adminUser.id,
              resendEmailId,
            },
          })
        } catch (logError) {
          console.error('Failed to log daily digest email:', logError)
        }
      } else {
        console.warn('No admin user found in database - skipping EmailFlowLog entry for daily digest')
      }
    }

    return NextResponse.json({ success: true, stats, emailSent: emailStatus === 'sent' })
  } catch (error) {
    console.error("Failed to send daily digest:", error)
    return NextResponse.json({
      error: "Failed to send daily digest",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
