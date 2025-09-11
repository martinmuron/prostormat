import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, content, recipientType } = await request.json()

    if (!subject || !content || !recipientType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let whereClause = {}
    
    if (recipientType === 'users') {
      whereClause = { role: 'user' }
    } else if (recipientType === 'location_owners') {
      whereClause = { role: 'venue_manager' }
    }
    // For 'all', we don't filter by role

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    let emailsSent = 0
    let emailsErrored = 0
    const errors: string[] = []

    // Create HTML version if content appears to be plain text
    const isHtml = content.includes('<') && content.includes('>')
    const htmlContent = isHtml ? content : `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
            <p><strong>Prostormat</strong> – Platforma pro hledání event prostorů</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | 
                <a href="https://prostormat-production.up.railway.app" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`

    for (const user of users) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [user.email],
          replyTo: REPLY_TO_EMAIL,
          subject: subject,
          html: htmlContent,
          text: content.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
        })

        emailsSent++

        // Log to Email Flow tracking system
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailType: 'custom_admin',
              recipient: user.email,
              subject: subject,
              status: 'sent',
              sentBy: session.user.id,
              recipientType: user.role
            })
          })
        } catch (logError) {
          console.error('Failed to log email to Email Flow:', logError)
        }

      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        emailsErrored++
        errors.push(`${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)

        // Log error to Email Flow tracking system
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailType: 'custom_admin',
              recipient: user.email,
              subject: subject,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              sentBy: session.user.id,
              recipientType: user.role
            })
          })
        } catch (logError) {
          console.error('Failed to log email error to Email Flow:', logError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsErrored,
      totalUsers: users.length,
      recipientType,
      errors
    })

  } catch (error) {
    console.error('Error sending custom email:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}