import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

const venueSchema = z.object({
  // Account fields
  userName: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  userEmail: z.string().email("Neplatný email"),
  userPassword: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  userPhone: z.string().optional(),
  
  // Venue fields
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  address: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  capacitySeated: z.number().optional(),
  capacityStanding: z.number().optional(),
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
    const body = await request.json()
    const validatedData = venueSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.userEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto emailem již existuje" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.userPassword, 12)

    // Generate unique slug for venue
    let baseSlug = generateSlug(validatedData.name)
    let slug = baseSlug
    let counter = 1

    while (await db.venue.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create user and venue in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.userName,
          email: validatedData.userEmail,
          password: hashedPassword,
          phone: validatedData.userPhone || null,
          role: "venue_manager", // Automatically make them a venue manager
        },
      })

      // Create venue
      const venue = await tx.venue.create({
        data: {
          name: validatedData.name,
          slug,
          description: validatedData.description || null,
          address: validatedData.address,
          capacitySeated: validatedData.capacitySeated || null,
          capacityStanding: validatedData.capacityStanding || null,
          venueType: validatedData.venueType || null,
          amenities: JSON.stringify(validatedData.amenities),
          contactEmail: validatedData.contactEmail || null,
          contactPhone: validatedData.contactPhone || null,
          websiteUrl: validatedData.websiteUrl || null,
          images: JSON.stringify(validatedData.images),
          videoUrl: validatedData.videoUrl || null,
          managerId: user.id,
          status: "draft", // Start as draft
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      })

      return { user, venue }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Účet a prostor byly úspěšně vytvořeny",
      venue: { id: result.venue.id, slug: result.venue.slug },
      user: { id: result.user.id, email: result.user.email }
    })
  } catch (error) {
    console.error("Error creating user and venue:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při vytváření účtu a prostoru" },
      { status: 500 }
    )
  }
} 