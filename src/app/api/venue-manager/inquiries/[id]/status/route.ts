import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["new", "answered", "completed"]),
  type: z.enum(["inquiry", "broadcast"]), // inquiry = VenueInquiry, broadcast = VenueBroadcastLog
})

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== "venue_manager" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, type } = updateStatusSchema.parse(body)

    // Update based on type
    if (type === "inquiry") {
      // Check if user is manager of this venue
      const inquiry = await prisma.venueInquiry.findUnique({
        where: { id },
        include: {
          venue: {
            select: {
              managerId: true,
            },
          },
        },
      })

      if (!inquiry) {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
      }

      // Only allow if user is the venue manager or admin
      if (session.user.role !== "admin" && inquiry.venue.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const updated = await prisma.venueInquiry.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json({ success: true, inquiry: updated })
    } else {
      // type === "broadcast"
      // Check if user is manager of this venue
      const broadcastLog = await prisma.venueBroadcastLog.findUnique({
        where: { id },
        include: {
          venue: {
            select: {
              managerId: true,
            },
          },
        },
      })

      if (!broadcastLog) {
        return NextResponse.json({ error: "Broadcast log not found" }, { status: 404 })
      }

      // Only allow if user is the venue manager or admin
      if (session.user.role !== "admin" && broadcastLog.venue.managerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const updated = await prisma.venueBroadcastLog.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json({ success: true, broadcastLog: updated })
    }
  } catch (error) {
    console.error("Error updating inquiry status:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 422 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
