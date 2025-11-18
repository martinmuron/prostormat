import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmailFromTemplate } from "@/lib/email-service"

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
      users = await db.user.findMany({
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
      users = await db.user.findMany({
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
        // Use DB-backed email template system
        await sendEmailFromTemplate({
          templateKey: templateType,
          to: user.email,
          variables: {
            name: user.name || (templateType === 'welcome_user' ? 'Uživatel' : 'Majitel prostoru'),
            email: user.email
          },
          tracking: {
            emailType: templateType,
            recipientType: templateType === 'welcome_user' ? 'user' : 'venue_owner',
            sentBy: session.user.id
          }
        })

        emailsSent++

      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        emailsErrored++
        errors.push(`${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Email Flow logging is handled automatically by sendEmailFromTemplate
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