import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email-service"
import { trackRegistration } from "@/lib/meta-conversions-api"
import { trackGA4ServerRegistration } from "@/lib/ga4-server-tracking"

const registerSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

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
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "user", // All registrations are "user" role
        company: null,
        phone: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Send welcome email (don't block registration if email fails)
    try {
      await sendWelcomeEmail({
        name: user.name || user.email,
        email: user.email,
        role: user.role
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Continue anyway - registration was successful
    }

    // Track registration event in Meta (don't block on failure)
    try {
      const [firstName, ...lastNameParts] = validatedData.name.split(' ')
      await trackRegistration({
        email: user.email,
        firstName: firstName,
        lastName: lastNameParts.join(' ') || undefined,
      }, request)
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
        request,
      })
    } catch (ga4Error) {
      console.error('Failed to track GA4 registration event:', ga4Error)
      // Continue anyway - registration was successful
    }

    return NextResponse.json({
      success: true,
      user,
    })
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