import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { randomUUID } from 'crypto'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeTrackingContext } from '@/lib/tracking-utils'
import { trackGA4ServerLead } from '@/lib/ga4-server-tracking'
import { trackVenueLead } from '@/lib/meta-conversions-api'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { generateVenueSubmissionNotificationEmail, generateVenueSubmissionConfirmationEmail } from '@/lib/email-templates'

function splitContactName(name: string | undefined) {
  if (!name) {
    return { firstName: undefined, lastName: undefined }
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: undefined }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

const trackingSchema = z
  .object({
    eventId: z.string().optional(),
    clientId: z.string().optional(),
    fbp: z.string().optional(),
    fbc: z.string().optional(),
  })
  .optional()

const submissionSchema = z.object({
  submissionType: z.enum(['new', 'claim', 'priority_interest']).default('new'),
  companyName: z.string().min(2).max(200).optional(),
  locationTitle: z.string().min(2).max(200).optional(),
  ico: z.string().min(4).max(32).optional(),
  contactName: z.string().min(2).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5).max(50),
  additionalInfo: z.string().max(2000).optional(),
  existingVenueId: z.string().optional(),
  packageType: z.enum(['priority', 'top_priority']).optional(),
  venueId: z.string().optional(),
  venueName: z.string().optional(),
  tracking: trackingSchema,
})

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const body = submissionSchema.parse(rawBody)
    const session = await getServerSession(authOptions)

    const userId = session?.user?.id ?? null
    const userEmail = session?.user?.email ?? undefined

    const submissionType = body.submissionType
    const isClaim = submissionType === 'claim'
    const isPriorityInterest = submissionType === 'priority_interest'

    if (!isPriorityInterest) {
      if (!body.companyName) {
        return NextResponse.json(
          { error: 'Název společnosti je povinný' },
          { status: 400 }
        )
      }

      if (!body.locationTitle) {
        return NextResponse.json(
          { error: 'Název prostoru je povinný' },
          { status: 400 }
        )
      }

      if (!body.ico) {
        return NextResponse.json(
          { error: 'IČO je povinné' },
          { status: 400 }
        )
      }

      if (isClaim && !body.existingVenueId) {
        return NextResponse.json(
          { error: 'ID existujícího prostoru je povinné pro převzetí' },
          { status: 400 }
        )
      }
    } else {
      if (!body.packageType) {
        return NextResponse.json(
          { error: 'Vyberte typ balíčku' },
          { status: 400 }
        )
      }

      if (!body.venueId && !body.venueName) {
        return NextResponse.json(
          { error: 'Vyberte prostor, o který máte zájem' },
          { status: 400 }
        )
      }
    }

    const tracking = sanitizeTrackingContext(body.tracking ?? undefined)

    const payload = {
      additionalInfo: body.additionalInfo ?? null,
      tracking,
      venueName: body.venueName ?? body.locationTitle ?? null,
      packageType: body.packageType ?? null,
    }

    const submission = await prisma.venueSubmissionRequest.create({
      data: {
        submissionType,
        companyName: body.companyName,
        locationTitle: body.locationTitle,
        ico: body.ico,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        additionalInfo: body.additionalInfo,
        userId,
        userEmail: userEmail ?? body.contactEmail,
        existingVenueId: isClaim ? body.existingVenueId ?? null : body.venueId ?? null,
        status: 'new',
        payload,
      },
    })

    const eventId = tracking?.eventId

    const nameParts = splitContactName(body.contactName)

    // Get admin user for logging system emails
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    })

    const logSentBy = userId || adminUser?.id

    // Send email notification to admin
    let adminEmailResendId: string | null = null

    try {
      const emailContent = generateVenueSubmissionNotificationEmail({
        submissionType,
        companyName: body.companyName,
        locationTitle: body.locationTitle,
        ico: body.ico,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        additionalInfo: body.additionalInfo,
        venueName: payload.venueName ?? undefined,
        existingVenueId: isClaim ? body.existingVenueId ?? undefined : body.venueId ?? undefined,
        submissionId: submission.id,
      })

      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: 'info@prostormat.cz',
        replyTo: body.contactEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      if (emailResult.data?.id && logSentBy) {
        adminEmailResendId = emailResult.data.id
        // Track in Email Flow system
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'venue_submission_notification',
              recipient: 'info@prostormat.cz',
              subject: emailContent.subject,
              status: 'sent',
              error: null,
              recipientType: 'admin',
              sentBy: logSentBy,
              resendEmailId: adminEmailResendId,
            },
          })
        } catch (logError) {
          console.error('Failed to log venue submission email:', logError)
        }
      }
    } catch (error) {
      console.error('Failed to send venue submission notification email:', error)
      const emailError = error instanceof Error ? error.message : 'Unknown error'

      // Track failed email in Email Flow system
      if (logSentBy) {
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'venue_submission_notification',
              recipient: 'info@prostormat.cz',
              subject: `Nová žádost: ${submissionType}`,
              status: 'failed',
              error: emailError,
              recipientType: 'admin',
              sentBy: logSentBy,
              resendEmailId: adminEmailResendId,
            },
          })
        } catch (logError) {
          console.error('Failed to log email failure:', logError)
        }
      }
    }

    // Send confirmation email to user (casual "Funguje to. Fakt." email)
    try {
      const confirmationEmailContent = generateVenueSubmissionConfirmationEmail({
        contactName: body.contactName,
        locationTitle: body.locationTitle || undefined,
        submissionType,
      })

      const userEmailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: body.contactEmail,
        subject: confirmationEmailContent.subject,
        html: confirmationEmailContent.html,
        text: confirmationEmailContent.text,
      })

      // Track user confirmation email in Email Flow system
      if (userEmailResult.data?.id && logSentBy) {
        const userEmailResendId = userEmailResult.data.id
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'venue_submission_confirmation',
              recipient: body.contactEmail,
              subject: confirmationEmailContent.subject,
              status: 'sent',
              error: null,
              recipientType: 'venue_owner',
              sentBy: logSentBy,
              resendEmailId: userEmailResendId,
            },
          })
        } catch (logError) {
          console.error('Failed to log user confirmation email:', logError)
        }
      }
    } catch (error) {
      console.error('Failed to send user confirmation email:', error)
      const emailError = error instanceof Error ? error.message : 'Unknown error'

      // Track failed confirmation email in Email Flow system
      if (logSentBy) {
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: randomUUID(),
              emailType: 'venue_submission_confirmation',
              recipient: body.contactEmail,
              subject: 'Děkujeme za tvou žádost na Prostormatu!',
              status: 'failed',
              error: emailError,
              recipientType: 'venue_owner',
              sentBy: logSentBy,
              resendEmailId: null,
            },
          })
        } catch (logError) {
          console.error('Failed to log confirmation email failure:', logError)
        }
      }
      // Don't fail the request if confirmation email fails
      // User submission was successful, they just won't get the confirmation email
    }

    await Promise.allSettled([
      trackGA4ServerLead({
        formType: isPriorityInterest ? 'priority_interest' : 'add_venue',
        eventType: submissionType,
        venueName: payload.venueName ?? undefined,
        venueId: submission.existingVenueId ?? undefined,
        userId: userId ?? undefined,
        email: body.contactEmail,
        clientId: body.tracking?.clientId,
        eventId,
        request,
      }),
      trackVenueLead(
        {
          email: body.contactEmail,
          phone: body.contactPhone,
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
        },
        {
          submissionType,
          venueName: payload.venueName ?? undefined,
          packageType: body.packageType ?? undefined,
        },
        request,
        eventId
      ),
    ])

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Failed to create venue submission:', error)
    return NextResponse.json(
      { error: 'Došlo k chybě při odesílání formuláře. Zkuste to prosím znovu.' },
      { status: 500 }
    )
  }
}
