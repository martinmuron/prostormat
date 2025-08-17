import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { generateWelcomeEmailForUser, generateWelcomeEmailForLocationOwner } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { templateType } = await request.json()

    if (!templateType || !['welcome_user', 'welcome_location_owner'].includes(templateType)) {
      return NextResponse.json({ error: "Invalid template type" }, { status: 400 })
    }

    let users
    let emailsSent = 0
    let emailsErrored = 0
    const errors: string[] = []

    if (templateType === 'welcome_user') {
      users = await db.prostormat_users.findMany({
        where: {
          role: 'user'
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    } else {
      users = await db.prostormat_users.findMany({
        where: {
          role: 'venue_manager'
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    }

    for (const user of users) {
      try {
        let emailData
        
        if (templateType === 'welcome_user') {
          emailData = generateWelcomeEmailForUser({
            name: user.name || 'Uživatel',
            email: user.email
          })
        } else {
          emailData = generateWelcomeEmailForLocationOwner({
            name: user.name || 'Majitel prostoru',
            email: user.email
          })
        }

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [user.email],
          replyTo: REPLY_TO_EMAIL,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
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
              emailType: templateType,
              recipient: user.email,
              subject: emailData.subject,
              status: 'sent',
              sentBy: session.user.id
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
              emailType: templateType,
              recipient: user.email,
              subject: templateType === 'welcome_user' ? 'Vítejte v Prostormatu!' : 'Vítejte v Prostormatu - Začněte nabízet své prostory!',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              sentBy: session.user.id
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
      errors
    })

  } catch (error) {
    console.error('Error sending welcome emails:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}