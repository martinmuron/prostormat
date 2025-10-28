import { NextResponse } from "next/server"
import { z } from "zod"
import { consumeEmailVerificationToken } from "@/lib/email-verification"
import type { ConsumeEmailVerificationTokenResult } from "@/lib/email-verification"
import { sendWelcomeEmail } from "@/lib/email-service"

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = schema.parse(body)

    const result = await consumeEmailVerificationToken(token)

    if (result.status === "verified") {
      try {
        await sendWelcomeEmail({
          name: result.user.name || result.user.email,
          email: result.user.email,
          role: result.user.role,
        })
      } catch (emailError) {
        console.error("Failed to send welcome email after verification:", emailError)
        // Continue even if the welcome email fails
      }

      return NextResponse.json({ success: true })
    }

    type VerificationErrorStatus = Exclude<ConsumeEmailVerificationTokenResult["status"], "verified">

    const errorMessages = {
      expired: "Odkaz pro ověření e-mailu vypršel. Požádejte o nový.",
      not_found: "Nesprávný ověřovací odkaz.",
      user_not_found: "Uživatel pro tento odkaz nebyl nalezen.",
    } satisfies Record<VerificationErrorStatus, string>

    const message = errorMessages[result.status] || "Nelze ověřit e-mail."

    return NextResponse.json({ success: false, error: message }, { status: 400 })
  } catch (error) {
    console.error("Email verification error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatný ověřovací odkaz." }, { status: 400 })
    }

    return NextResponse.json({ error: "Došlo k chybě při ověřování e-mailu." }, { status: 500 })
  }
}
