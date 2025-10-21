import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { emailTriggerDefinitions } from "@/data/email-template-definitions"
import { ensureEmailDataSeeded } from "@/lib/email-admin"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await ensureEmailDataSeeded()

    const triggers = await db.emailTrigger.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ triggers })
  } catch (error) {
    console.error("Error fetching email triggers:", error)
    const fallbackTriggers = emailTriggerDefinitions.map((trigger) => ({
      ...trigger,
      id: trigger.triggerKey,
      createdAt: null,
      updatedAt: null,
    }))
    return NextResponse.json({ triggers: fallbackTriggers, fallback: true })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const {
      triggerKey,
      isEnabled,
      name,
      description,
      templateKey,
    } = body

    if (!triggerKey) {
      return new NextResponse("Trigger key is required", { status: 400 })
    }

    const trigger = await db.emailTrigger.upsert({
      where: { triggerKey },
      update: {
        isEnabled,
        name,
        description,
        templateKey,
        updatedAt: new Date(),
      },
      create: {
        triggerKey,
        isEnabled,
        name: name ?? triggerKey,
        description,
        templateKey: templateKey ?? triggerKey,
      },
    })

    return NextResponse.json({ trigger })
  } catch (error) {
    console.error("Error updating email trigger:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
