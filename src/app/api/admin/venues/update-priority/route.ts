import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePrioritySchema = z.object({
  venueId: z.string().min(1),
  priority: z.number().int().min(1).max(3).nullable(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { venueId, priority } = updatePrioritySchema.parse(json)

    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { priority },
      select: {
        id: true,
        priority: true,
      },
    })

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error('Error updating venue priority:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
