import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateVenueSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().min(5).optional(),
  district: z.string().min(3).optional(),
  venueType: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "expired", "suspended"]).optional(),
  featured: z.boolean().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Validate request body
    const json = await request.json()
    const body = updateVenueSchema.parse(json)

    // Update the venue
    const updatedVenue = await db.venue.update({
      where: { id: params.id },
      data: {
        ...body,
        // Ensure we don't set undefined values
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error("Error updating venue:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    
    return new NextResponse("Internal server error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the venue
    const venue = await db.venue.findUnique({
      where: { id: params.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!venue) {
      return new NextResponse("Venue not found", { status: 404 })
    }

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Error fetching venue:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
