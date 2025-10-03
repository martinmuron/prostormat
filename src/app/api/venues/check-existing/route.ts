import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

const checkSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2).optional(),
})

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address } = checkSchema.parse(body)

    const trimmedName = name.trim()
    const normalizedAddress = address ? normalize(address) : null
    const slugCandidate = slugify(name)

    const existingVenue = await db.venue.findFirst({
      where: {
        parentId: null,
        OR: [
          { name: { equals: trimmedName, mode: 'insensitive' } },
          { slug: slugCandidate },
          ...(normalizedAddress
            ? [{ address: { contains: normalizedAddress, mode: Prisma.QueryMode.insensitive } }]
            : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        priority: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!existingVenue) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      venue: existingVenue,
    })
  } catch (error) {
    console.error('Error checking venue existence:', error)
    return NextResponse.json({ error: 'Failed to check venue' }, { status: 500 })
  }
}
