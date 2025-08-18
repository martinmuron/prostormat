import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email flow logs (we'll need to create this table)
    const emailLogs = await db.prostormat_email_flow_logs.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        prostormat_users: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Get summary statistics
    const stats = await db.prostormat_email_flow_logs.groupBy({
      by: ['emailType', 'status'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      logs: emailLogs,
      stats
    })

  } catch (error) {
    console.error('Error fetching email flow:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { emailType, recipient, subject, status, error, sentBy, recipientType } = await request.json()

    if (!emailType || !recipient || !subject || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const logEntry = await db.prostormat_email_flow_logs.create({
      data: {
        emailType,
        recipient,
        subject,
        status,
        error: error || null,
        sentBy: sentBy || session.user.id,
        recipientType: recipientType || null,
        createdAt: new Date()
      }
    })

    return NextResponse.json({ success: true, logEntry })

  } catch (dbError) {
    console.error('Error logging email to flow:', dbError)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}