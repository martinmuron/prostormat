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
  youtubeUrl: z.string().url().optional().nullable(),
  status: z.enum(["draft", "active", "expired", "suspended"]).optional(),
  featured: z.boolean().optional(),
  managerId: z.string().optional(), // Allow admin to assign managers
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin or venue manager for this venue
    if (session.user.role !== "admin") {
      if (session.user.role !== "venue_manager") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
      
      // Verify venue manager owns this venue
      const venue = await db.venue.findUnique({
        where: { id },
        select: { managerId: true }
      })
      
      if (!venue || venue.managerId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Validate request body
    const json = await request.json()
    const body = updateVenueSchema.parse(json)

    // Prepare update data
    const updateData: any = { ...body }
    
    // Only admins can change managerId
    if (session.user.role !== "admin" && body.managerId) {
      delete updateData.managerId
    }

    // If managerId is provided and user is admin, verify the manager exists
    if (body.managerId && session.user.role === "admin") {
      const manager = await db.user.findUnique({
        where: { id: body.managerId },
        select: { role: true }
      })
      
      if (!manager || manager.role !== "venue_manager") {
        return new NextResponse("Invalid manager ID - user must be a venue_manager", { status: 400 })
      }
    }

    // Update the venue
    const updatedVenue = await db.venue.update({
      where: { id },
      data: {
        ...updateData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin or venue manager for this venue
    if (session.user.role !== "admin") {
      if (session.user.role !== "venue_manager") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
      
      // Verify venue manager owns this venue
      const venueCheck = await db.venue.findUnique({
        where: { id },
        select: { managerId: true }
      })
      
      if (!venueCheck || venueCheck.managerId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Get the venue
    const venue = await db.venue.findUnique({
      where: { id },
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
