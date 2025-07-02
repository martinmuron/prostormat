import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const venueSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  address: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  capacitySeated: z.number().optional(),
  capacityStanding: z.number().optional(),
  priceRange: z.string().optional(),
  venueType: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  contactEmail: z.string().email("Neplatný email").optional(),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url("Neplatná URL").optional().or(z.literal("")),
  images: z.array(z.string()).max(10, "Maximálně 10 obrázků").default([]),
  videoUrl: z.string().optional(),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 }
      )
    }

    // Check if user has venue_manager role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    // If user is not a venue manager or admin, promote them to venue manager
    // This allows new venue owners to onboard to the platform
    if (user?.role === "user") {
      await db.user.update({
        where: { id: session.user.id },
        data: { role: "venue_manager" }
      })
    }

    const body = await request.json()
    const validatedData = venueSchema.parse(body)

    // Generate unique slug
    let baseSlug = generateSlug(validatedData.name)
    let slug = baseSlug
    let counter = 1

    while (await db.venue.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create venue
    const venue = await db.venue.create({
      data: {
        ...validatedData,
        slug,
        managerId: session.user.id,
        status: "draft", // Start as draft, can be activated later
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    })

    return NextResponse.json({ 
      success: true, 
      venue: { id: venue.id, slug: venue.slug }
    })
  } catch (error) {
    console.error("Error creating venue:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při vytváření prostoru" },
      { status: 500 }
    )
  }
} 