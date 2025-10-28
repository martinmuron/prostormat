import crypto from "crypto"
import { db } from "@/lib/db"

const DEFAULT_EXPIRATION_HOURS = 48

function getExpirationHours(): number {
  const fromEnv = process.env.EMAIL_VERIFICATION_EXPIRATION_HOURS

  if (!fromEnv) {
    return DEFAULT_EXPIRATION_HOURS
  }

  const parsed = Number.parseInt(fromEnv, 10)
  return Number.isNaN(parsed) ? DEFAULT_EXPIRATION_HOURS : Math.max(parsed, 1)
}

export async function createEmailVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(
    Date.now() + getExpirationHours() * 60 * 60 * 1000
  )

  // Remove previously issued tokens for this identifier
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return verificationToken
}

export function buildEmailVerificationUrl(token: string) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")

  return `${baseUrl.replace(/\/$/, "")}/potvrdit-email?token=${token}`
}

export type ConsumeEmailVerificationTokenResult =
  | { status: "verified"; user: { id: string; email: string; name: string | null; role: string } }
  | { status: "not_found" | "expired" | "user_not_found" }

export async function consumeEmailVerificationToken(token: string): Promise<ConsumeEmailVerificationTokenResult> {
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { status: "not_found" as const }
  }

  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({
      where: { token },
    })
    return { status: "expired" as const }
  }

  const userRecord = await db.user.findUnique({
    where: { email: verificationToken.identifier },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      role: true,
    },
  })

  if (!userRecord) {
    await db.verificationToken.delete({
      where: { token },
    })
    return { status: "user_not_found" as const }
  }

  if (!userRecord.emailVerified) {
    await db.user.update({
      where: { id: userRecord.id },
      data: { emailVerified: new Date() },
    })
  }

  // Remove any remaining tokens for this identifier
  await db.verificationToken.deleteMany({
    where: { identifier: verificationToken.identifier },
  })

  return {
    status: "verified" as const,
    user: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
    },
  }
}
