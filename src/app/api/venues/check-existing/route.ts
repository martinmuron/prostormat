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

    const searchTerms = trimmedName
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length >= 3)

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
        address: true,
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

    const suggestionFilters: Prisma.VenueWhereInput[] = [
      { name: { contains: trimmedName, mode: 'insensitive' } },
      { slug: { contains: slugCandidate } },
    ]

    for (const term of searchTerms) {
      suggestionFilters.push({ name: { contains: term, mode: 'insensitive' } })
      suggestionFilters.push({ slug: { contains: slugify(term) } })
    }

    if (normalizedAddress) {
      suggestionFilters.push({
        address: { contains: normalizedAddress, mode: Prisma.QueryMode.insensitive },
      })
    }

    const suggestionWhere: Prisma.VenueWhereInput = {
      parentId: null,
      OR: suggestionFilters,
    }

    if (existingVenue) {
      suggestionWhere.id = { not: existingVenue.id }
    }

    const similarVenues =
      trimmedName.length >= 1
        ? await db.venue.findMany({
            where: suggestionWhere,
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              status: true,
              manager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            take: 5,
          })
        : []

    if (!existingVenue) {
      return NextResponse.json({
        exists: false,
        venue: null,
        suggestions: similarVenues,
      })
    }

    return NextResponse.json({
      exists: true,
      venue: existingVenue,
      suggestions: similarVenues,
    })
  } catch (error) {
    console.error('Error checking venue existence:', error)
    return NextResponse.json({ error: 'Failed to check venue' }, { status: 500 })
  }
}
