import { NextResponse } from "next/server"
import { z } from "zod"
import { consumeEmailVerificationToken } from "@/lib/email-verification"
import type { ConsumeEmailVerificationTokenResult } from "@/lib/email-verification"
import { sendWelcomeEmail } from "@/lib/email-service"
import { authOptions } from "@/lib/auth"
import { encode } from "next-auth/jwt"

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = schema.parse(body)

    const result = await consumeEmailVerificationToken(token)

    if (result.status === "verified") {
      const secret = authOptions.secret || process.env.NEXTAUTH_SECRET

      if (!secret) {
        console.error("NEXTAUTH_SECRET is not set. Cannot create session after verification.")
      }

      let sessionToken: string | null = null

      if (secret) {
        const maxAge = authOptions.session?.maxAge ?? 30 * 24 * 60 * 60
        sessionToken = await encode({
          token: {
            name: result.user.name || result.user.email,
            email: result.user.email,
            sub: result.user.id,
            role: result.user.role,
          },
          secret,
          maxAge,
        })
      }

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

      const response = NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      })

      if (sessionToken) {
        const cookieName =
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token"

        const maxAge = authOptions.session?.maxAge ?? 30 * 24 * 60 * 60

        response.cookies.set(cookieName, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge,
        })
      }

      return response
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
