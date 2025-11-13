import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const broadcast = await prisma.venueBroadcast.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      sentCount: true,
      lastSentAt: true,
    },
  })

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 })
  }

  const totalVenues = await prisma.venueBroadcastLog.count({
    where: { broadcastId: id },
  })

  const pendingCount = await prisma.venueBroadcastLog.count({
    where: { broadcastId: id, emailStatus: "pending" },
  })

  return NextResponse.json({
    id: broadcast.id,
    status: broadcast.status,
    sentCount: broadcast.sentCount,
    totalVenues,
    pendingCount,
    lastSentAt: broadcast.lastSentAt,
  })
}
