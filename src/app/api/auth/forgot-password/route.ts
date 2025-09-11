import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import crypto from "crypto"
import { Resend } from "resend"
import { generatePasswordResetEmail } from "@/lib/email-templates"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const user = await db.prostormat_users.findUnique({ where: { email } })

    // Always respond 200 to avoid user enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Invalidate previous tokens for this user
    await (db as any).prostormat_password_reset_tokens.deleteMany({
      where: { userId: user.id },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 minutes

    await (db as any).prostormat_password_reset_tokens.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-heslo?token=${token}`

    // Send email (best-effort)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const emailData = generatePasswordResetEmail(resetUrl)
      try {
        await resend.emails.send({
          from: "Prostormat <no-reply@prostormat.cz>",
          to: [email],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        })
      } catch (e) {
        console.error("Failed to send reset email", e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatný e‑mail" }, { status: 400 })
    }
    console.error("Forgot password error:", err)
    return NextResponse.json({ error: "Došlo k chybě" }, { status: 500 })
  }
} 
