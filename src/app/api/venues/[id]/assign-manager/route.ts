import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const assignManagerSchema = z.object({
  email: z.string().email(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Verify authentication - only admins can assign managers
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Validate request body
    const json = await request.json()
    const { email } = assignManagerSchema.parse(json)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true, name: true, email: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update user role to venue_manager if they're not already
    if (user.role !== "venue_manager") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "venue_manager" }
      })
    }

    // Assign user as manager to the venue
    const updatedVenue = await db.venue.update({
      where: { id },
      data: { managerId: user.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      manager: user
    })

  } catch (error) {
    console.error("Error assigning manager:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    
    return new NextResponse("Internal server error", { status: 500 })
  }
}