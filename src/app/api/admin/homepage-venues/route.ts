import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const slotsSchema = z.object({
  slots: z.array(
    z.object({
      position: z.number().int().min(1).max(12),
      venueId: z.string().min(1),
    })
  ).length(12),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const homepageVenues = await prisma.homepageVenue.findMany({
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            priority: true,
            images: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    })

    const filledSlots = Array.from({ length: 12 }, (_, index) => {
      const position = index + 1
      const match = homepageVenues.find((item) => item.position === position)
      return {
        position,
        venue: match?.venue ?? null,
      }
    })

    return NextResponse.json({ slots: filledSlots })
  } catch (error) {
    console.error('Error fetching homepage venues:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage venues' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    const { slots } = slotsSchema.parse(payload)

    const positions = new Set<number>()
    const venueIds = new Set<string>()

    for (const slot of slots) {
      if (positions.has(slot.position)) {
        return NextResponse.json({ error: `Duplicate position ${slot.position}` }, { status: 400 })
      }
      if (venueIds.has(slot.venueId)) {
        return NextResponse.json({ error: 'Each venue can only be selected once' }, { status: 400 })
      }
      positions.add(slot.position)
      venueIds.add(slot.venueId)
    }

    // Ensure all positions 1-12 are covered
    if (positions.size !== 12) {
      return NextResponse.json({ error: 'All 12 homepage slots must be assigned' }, { status: 400 })
    }

    const existingVenues = await prisma.venue.findMany({
      where: {
        id: {
          in: Array.from(venueIds),
        },
      },
      select: { id: true },
    })

    if (existingVenues.length !== venueIds.size) {
      return NextResponse.json({ error: 'One or more selected venues do not exist' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.homepageVenue.deleteMany({}),
      prisma.homepageVenue.createMany({
        data: slots.map((slot) => ({
          position: slot.position,
          venueId: slot.venueId,
        })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating homepage venues:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: 'Failed to update homepage venues' }, { status: 500 })
  }
}
