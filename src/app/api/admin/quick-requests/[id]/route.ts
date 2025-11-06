import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: "Missing quick request ID" }, { status: 400 })
  }

  try {
    await prisma.$transaction([
      prisma.venueBroadcastLog.deleteMany({
        where: { broadcastId: id },
      }),
      prisma.venueBroadcast.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Quick request not found" }, { status: 404 })
    }

    console.error("Failed to delete quick request", error)
    return NextResponse.json({ error: "Failed to delete quick request" }, { status: 500 })
  }
}
