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

    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
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
    const { id, subject, htmlContent, textContent, isActive } = body

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        subject,
        htmlContent,
        textContent,
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating email template:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
