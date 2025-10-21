import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { emailTemplateDefinitions } from "@/data/email-template-definitions"
import { ensureEmailDataSeeded } from "@/lib/email-admin"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await ensureEmailDataSeeded()

    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    const fallbackTemplates = emailTemplateDefinitions.map((template) => ({
      ...template,
      id: template.templateKey,
      createdAt: null,
      updatedAt: null,
    }))
    return NextResponse.json({ templates: fallbackTemplates, fallback: true })
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
      templateKey,
      subject,
      htmlContent,
      textContent,
      isActive,
      name,
      description,
      variables,
    } = body

    if (!templateKey) {
      return new NextResponse("Template key is required", { status: 400 })
    }

    const template = await db.emailTemplate.upsert({
      where: { templateKey },
      update: {
        subject,
        htmlContent,
        textContent,
        isActive,
        name,
        description,
        variables,
        updatedAt: new Date(),
      },
      create: {
        templateKey,
        subject,
        htmlContent,
        textContent,
        isActive,
        name: name ?? templateKey,
        description,
        variables: variables ?? [],
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating email template:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
