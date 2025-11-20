import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { rateLimit, rateLimitConfigs, rateLimitResponse } from "@/lib/rate-limit"

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
})

export async function POST(req: Request) {
  // Rate limit: 5 requests per minute for password reset
  const rateLimitResult = rateLimit(req, "auth/reset-password", rateLimitConfigs.auth)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await req.json()
    const { token, password } = schema.parse(body)

    const record = await db.passwordResetToken.findUnique({
      where: { token },
    })

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Neplatný nebo expirovaný odkaz" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      db.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } })
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Neplatná data" }, { status: 400 })
    }
    console.error("Reset password error:", err)
    return NextResponse.json({ error: "Došlo k chybě" }, { status: 500 })
  }
} 
