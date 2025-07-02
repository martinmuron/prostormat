import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const updateVenueSchema = z.object({
  status: z.enum(["draft", "active", "expired"]).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  priceRange: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Simple password check via header
    const adminPassword = request.headers.get("x-admin-password")
    
    if (adminPassword !== "112233") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateVenueSchema.parse(body)

    // Update venue
    const updatedVenue = await db.venue.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error("Error updating venue:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Simple password check via header
    const adminPassword = request.headers.get("x-admin-password")
    
    if (adminPassword !== "112233") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Delete all related inquiries first
    await db.venueInquiry.deleteMany({
      where: { venueId: id }
    })

    // Delete venue
    await db.venue.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting venue:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 