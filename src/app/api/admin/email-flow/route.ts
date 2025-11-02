import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Ensure valid pagination values
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 per page
    const skip = (validPage - 1) * validLimit

    // Get total count for pagination
    const totalCount = await db.emailFlowLog.count()

    // Get email flow logs with pagination
    const emailLogs = await db.emailFlowLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: validLimit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Get summary statistics
    const stats = await db.emailFlowLog.groupBy({
      by: ['emailType', 'status'],
      _count: {
        id: true
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit)

    return NextResponse.json({
      logs: emailLogs,
      stats,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalCount,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      }
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

    const logEntry = await db.emailFlowLog.create({
      data: {
        id: randomUUID(),
        emailType,
        recipient,
        subject,
        status,
        error: error || null,
        sentBy: sentBy || session.user.id,
        recipientType: recipientType || null
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
