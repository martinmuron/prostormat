import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const triggers = await db.emailTrigger.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ triggers })
  } catch (error) {
    console.error("Error fetching email triggers:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { id, isEnabled } = body

    if (!id) {
      return new NextResponse("Trigger ID is required", { status: 400 })
    }

    const trigger = await db.emailTrigger.update({
      where: { id },
      data: {
        isEnabled,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ trigger })
  } catch (error) {
    console.error("Error updating email trigger:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
