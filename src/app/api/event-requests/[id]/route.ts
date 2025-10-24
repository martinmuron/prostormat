import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const updateEventRequestSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  eventType: z.string().min(1).optional(),
  eventDate: z.union([z.string(), z.null()]).optional(),
  guestCount: z.union([z.coerce.number().min(1), z.null()]).optional(),
  budgetRange: z.union([z.string(), z.null()]).optional(),
  locationPreference: z.union([z.string(), z.null()]).optional(),
  requirements: z.union([z.string(), z.null()]).optional(),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.union([z.string(), z.null()]).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 }
      )
    }

    const existingRequest = await db.eventRequest.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Poptávka nebyla nalezena" },
        { status: 404 }
      )
    }

    if (existingRequest.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnění upravit tuto poptávku" },
        { status: 403 }
      )
    }

    const json = await request.json()
    const body = updateEventRequestSchema.parse(json)

    const updateData: Record<string, unknown> = {}

    if (typeof body.title !== "undefined") {
      updateData.title = body.title.trim()
    }

    if (typeof body.description !== "undefined") {
      const trimmed = body.description?.trim()
      updateData.description = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (typeof body.eventType !== "undefined") {
      updateData.eventType = body.eventType
    }

    if (typeof body.eventDate !== "undefined") {
      if (body.eventDate) {
        const parsedDate = new Date(body.eventDate)
        if (Number.isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: "Neplatné datum akce" },
            { status: 400 }
          )
        }
        updateData.eventDate = parsedDate
      } else {
        updateData.eventDate = null
      }
    }

    if (typeof body.guestCount !== "undefined") {
      updateData.guestCount = body.guestCount ?? null
    }

    if (typeof body.budgetRange !== "undefined") {
      const trimmed = body.budgetRange?.trim()
      updateData.budgetRange = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (typeof body.locationPreference !== "undefined") {
      const trimmed = body.locationPreference?.trim()
      updateData.locationPreference = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (typeof body.requirements !== "undefined") {
      const trimmed = body.requirements?.trim()
      updateData.requirements = trimmed && trimmed.length > 0 ? trimmed : null
    }

    if (typeof body.contactName !== "undefined") {
      updateData.contactName = body.contactName.trim()
    }

    if (typeof body.contactEmail !== "undefined") {
      updateData.contactEmail = body.contactEmail.trim()
    }

    if (typeof body.contactPhone !== "undefined") {
      const trimmed = body.contactPhone?.trim()
      updateData.contactPhone = trimmed && trimmed.length > 0 ? trimmed : null
    }

    await db.eventRequest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating event request:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při aktualizaci poptávky" },
      { status: 500 }
    )
  }
}
