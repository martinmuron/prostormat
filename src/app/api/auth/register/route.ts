import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email-service"

const registerSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  role: z.enum(["user", "venue_manager"]),
  company: z.string().optional(),
  phone: z.string().optional(),
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

    // Create user
    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        company: validatedData.company || null,
        phone: validatedData.phone || null,
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