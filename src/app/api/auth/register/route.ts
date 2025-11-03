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
import { resend } from "@/lib/resend"
import { generateUserRegistrationAdminNotificationEmail } from "@/lib/email-templates"
import { randomUUID } from "crypto"

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
        await sendVerificationEmail(
          {
            name: user.name || user.email,
            email: user.email,
            verificationLink: verificationUrl,
          },
          { sentBy: user.id, recipientType: 'user' }
        )
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

    // Send admin notification email (best-effort)
    let adminEmailStatus: 'sent' | 'failed' = 'sent'
    let adminEmailError: string | null = null
    let adminEmailResendId: string | null = null
    try {
      const adminNotification = generateUserRegistrationAdminNotificationEmail({
        userId: user.id,
        email: user.email,
        name: user.name || user.email,
        company: validatedData.company,
        phone: validatedData.phone,
        registeredAt: new Date(),
      })

      const adminEmailResult = await resend.emails.send({
        from: 'Prostormat <info@prostormat.cz>',
        to: 'info@prostormat.cz',
        subject: adminNotification.subject,
        html: adminNotification.html,
        text: adminNotification.text,
      })
      adminEmailResendId = adminEmailResult.data?.id ?? null
    } catch (sendError) {
      adminEmailStatus = 'failed'
      adminEmailError = sendError instanceof Error ? sendError.message : 'Unknown error'
      console.error('Failed to send admin registration notification:', sendError)
      // Continue anyway - registration was successful
    }

    // Track admin notification in Email Flow Log (best-effort)
    try {
      await db.emailFlowLog.create({
        data: {
          id: randomUUID(),
          emailType: 'user_registration_admin_notification',
          recipient: 'info@prostormat.cz',
          subject: `Nová registrace uživatele: ${user.email}`,
          status: adminEmailStatus,
          error: adminEmailError,
          recipientType: 'admin',
          sentBy: user.id,
          resendEmailId: adminEmailResendId,
        },
      })
    } catch (logError) {
      console.error('Failed to log registration admin notification:', logError)
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
