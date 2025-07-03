import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await db.venueFavorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            capacitySeated: true,
            capacityStanding: true,
            venueType: true,
            images: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const venuesWithFavoriteInfo = favorites.map(fav => ({
      ...fav.venue,
      favoritedAt: fav.createdAt
    }))

    return NextResponse.json({
      favorites: venuesWithFavoriteInfo,
      count: favorites.length
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}