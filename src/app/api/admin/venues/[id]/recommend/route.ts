import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Admin authentication check
function checkAdminAuth(request: NextRequest) {
  const adminPassword = request.headers.get("x-admin-password")
  return adminPassword === "112233"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { isRecommended } = body

    if (typeof isRecommended !== "boolean") {
      return NextResponse.json({ error: "isRecommended must be a boolean" }, { status: 400 })
    }

    // Update venue recommendation status
    const venue = await db.venue.update({
      where: { id },
      data: { isRecommended },
      include: {
        manager: {
          select: { name: true, email: true }
        },
        _count: {
          select: { inquiries: true }
        }
      }
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Error updating venue recommendation:", error)
    return NextResponse.json({ error: "Failed to update venue recommendation" }, { status: 500 })
  }
}
