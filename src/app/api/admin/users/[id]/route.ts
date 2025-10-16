import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.union([z.string().min(1), z.literal("")]).optional(),
  email: z.string().email().optional(),
  phone: z.union([z.string(), z.literal("")]).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const body = updateUserSchema.parse(payload)

    const data: Record<string, unknown> = {}

    if (typeof body.name !== "undefined") {
      const trimmed = body.name?.trim()
      data.name = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (typeof body.email !== "undefined") {
      data.email = body.email.trim().toLowerCase()
    }

    if (typeof body.phone !== "undefined") {
      const trimmed = body.phone?.trim()
      data.phone = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields provided" }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: unknown) {
    console.error("Error updating user:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 422 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
