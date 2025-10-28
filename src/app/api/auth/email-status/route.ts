import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await db.user.findUnique({
      where: { email },
      select: {
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      emailVerified: Boolean(user.emailVerified),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatná e-mailová adresa." }, { status: 400 })
    }

    console.error("Email status check failed:", error)
    return NextResponse.json({ error: "Došlo k chybě při ověřování stavu e-mailu." }, { status: 500 })
  }
}

