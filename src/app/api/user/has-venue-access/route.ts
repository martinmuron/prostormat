import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasActiveVenueAccess } from '@/lib/venue-access'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ hasAccess: false })
    }

    const hasAccess = await hasActiveVenueAccess(session.user.id)

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Error checking venue access:', error)
    return NextResponse.json({ hasAccess: false })
  }
}
