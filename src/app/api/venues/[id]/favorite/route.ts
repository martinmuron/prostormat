import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const venueId = resolvedParams.id

    // Check if venue exists
    const venue = await db.venue.findUnique({
      where: { id: venueId }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // TODO: Fix VenueFavorite model - temporarily disabled for deployment
    // Check if already favorited
    // const existingFavorite = await db.venueFavorite.findUnique({
    //   where: {
    //     userId_venueId: {
    //       userId: session.user.id,
    //       venueId: venueId
    //     }
    //   }
    // })

    // if (existingFavorite) {
    //   return NextResponse.json({ message: 'Already favorited', isFavorited: true })
    // }

    // // Add to favorites
    // await db.venueFavorite.create({
    //   data: {
    //     id: randomUUID(),
    //     userId: session.user.id,
    //     venueId: venueId
    //   }
    // })

    return NextResponse.json({ message: 'Added to favorites (temporarily disabled)', isFavorited: true })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await params

    // TODO: Fix VenueFavorite model - temporarily disabled for deployment
    // Remove from favorites
    // await db.venueFavorite.deleteMany({
    //   where: {
    //     userId: session.user.id,
    //     venueId: venueId
    //   }
    // })

    return NextResponse.json({ message: 'Removed from favorites (temporarily disabled)', isFavorited: false })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false })
    }

    await params

    // TODO: Fix VenueFavorite model - temporarily disabled for deployment
    // const favorite = await db.venueFavorite.findUnique({
    //   where: {
    //     userId_venueId: {
    //       userId: session.user.id,
    //       venueId: venueId
    //     }
    //   }
    // })

    return NextResponse.json({ isFavorited: false })
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json({ isFavorited: false })
  }
}