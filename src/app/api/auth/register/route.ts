import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email-service"
import { trackRegistration } from "@/lib/meta-conversions-api"
import { trackGA4ServerRegistration } from "@/lib/ga4-server-tracking"
import {
  buildEmailVerificationUrl,
  createEmailVerificationToken,
} from "@/lib/email-verification"

const trackingSchema = z.object({
  eventId: z.string(),
  clientId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
}).optional()

const registerSchema = z.object({
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

const payloadSchema = registerSchema.extend({
  tracking: trackingSchema,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tracking, ...validatedData } = payloadSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto e-mailem již existuje" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user (all users are "user" role by default)
    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        name: validatedData.email,
        email: validatedData.email,
        password: hashedPassword,
        role: "user", // All registrations are "user" role
        company: validatedData.company ?? null,
        phone: validatedData.phone ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Create verification token (don't block registration on failure)
    let verificationUrl: string | null = null
    try {
      const verificationToken = await createEmailVerificationToken(user.email)
      verificationUrl = buildEmailVerificationUrl(verificationToken.token)
    } catch (tokenError) {
      console.error("Failed to create verification token:", tokenError)
    }

    // Send verification email (best-effort)
    try {
      if (verificationUrl) {
        await sendVerificationEmail({
          name: user.name || user.email,
          email: user.email,
          verificationLink: verificationUrl,
        })
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue anyway - registration was successful
    }

    // Track registration event in Meta (don't block on failure)
    try {
      await trackRegistration({
        email: user.email,
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
      }, request, tracking?.eventId)
    } catch (metaError) {
      console.error('Failed to track Meta registration event:', metaError)
      // Continue anyway - registration was successful
    }

    // Track registration event in GA4 (don't block on failure)
    try {
      await trackGA4ServerRegistration({
        userId: user.id,
        email: user.email,
        method: 'email',
        clientId: tracking?.clientId,
        eventId: tracking?.eventId,
        request,
      })
    } catch (ga4Error) {
      console.error('Failed to track GA4 registration event:', ga4Error)
      // Continue anyway - registration was successful
    }

    return NextResponse.json(
      {
        success: true,
        requiresEmailConfirmation: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Došlo k chybě při registraci" },
      { status: 500 }
    )
  }
}
