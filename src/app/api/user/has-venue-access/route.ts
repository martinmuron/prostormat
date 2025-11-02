import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ hasAccess: false })
    }

    // Check if user has at least one active/published venue (with paid/subscribed status)
    const venues = await db.venue.findMany({
      where: {
        managerId: session.user.id,
        status: { in: ['active', 'published'] }
      },
      select: {
        id: true,
        paid: true,
        subscription: {
          select: {
            status: true
          }
        }
      }
    })

    // User has access if they have at least one active/published venue that is either:
    // 1. Paid (paid === true)
    // 2. Has an active subscription
    const hasAccess = venues.some(venue =>
      venue.paid || venue.subscription?.status === 'active'
    )

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Error checking venue access:', error)
    return NextResponse.json({ hasAccess: false })
  }
}
