import { ensureEmailDataSeeded } from '@/lib/email-admin'
import { db } from '@/lib/db'
import { FROM_EMAIL, REPLY_TO_EMAIL, resend } from '@/lib/resend'
import { logEmailFlow } from '@/lib/email-helpers'

interface SendEmailFromTemplateParams {
  templateKey: string
  to: string
  variables: Record<string, string>
  checkTrigger?: string
  tracking?: {
    emailType?: string
    recipientType?: string | null
    sentBy?: string | null
    fallbackSentBy?: string | null
  }
}

/**
 * Send email using database template with variable replacement
 */
export async function sendEmailFromTemplate({
  templateKey,
  to,
  variables,
  checkTrigger,
  tracking,
}: SendEmailFromTemplateParams) {
  let seedingAttempted = false
  const ensureSeededData = async () => {
    if (seedingAttempted) {
      return
    }
    await ensureEmailDataSeeded()
    seedingAttempted = true
  }

  try {
    // Check if trigger is enabled (if specified)
    if (checkTrigger) {
      let trigger = await db.emailTrigger.findUnique({
        where: { triggerKey: checkTrigger }
      })

      if (!trigger) {
        await ensureSeededData()
        trigger = await db.emailTrigger.findUnique({
          where: { triggerKey: checkTrigger }
        })
      }

      if (!trigger) {
        throw new Error(`Email trigger "${checkTrigger}" not found`)
      }

      if (!trigger.isEnabled) {
        console.log(`Email trigger "${checkTrigger}" is disabled, skipping email`)
        await logEmailFlow({
          emailType: tracking?.emailType ?? templateKey,
          recipient: to,
          subject: templateKey,
          status: 'skipped',
          error: 'trigger_disabled',
          recipientType: tracking?.recipientType ?? null,
          sentBy: tracking?.sentBy ?? null,
          fallbackSentBy: tracking?.fallbackSentBy ?? null,
        })
        return { success: false, reason: 'trigger_disabled', subject: templateKey }
      }
    }

    // Get template from database
    let template = await db.emailTemplate.findUnique({
      where: { templateKey }
    })

    if (!template) {
      await ensureSeededData()
      template = await db.emailTemplate.findUnique({
        where: { templateKey }
      })
    }

    if (!template) {
      throw new Error(`Email template "${templateKey}" not found`)
    }

    if (!template.isActive) {
      console.log(`Email template "${templateKey}" is inactive, skipping email`)
      await logEmailFlow({
        emailType: tracking?.emailType ?? templateKey,
        recipient: to,
        subject: template.subject,
        status: 'skipped',
        error: 'template_inactive',
        recipientType: tracking?.recipientType ?? null,
        sentBy: tracking?.sentBy ?? null,
        fallbackSentBy: tracking?.fallbackSentBy ?? null,
      })
      return { success: false, reason: 'template_inactive', subject: template.subject }
    }

    // Replace variables in subject and content
    let subject = template.subject
    let htmlContent = template.htmlContent
    let textContent = template.textContent || ''

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value)
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value)
    }

    // Send email via Resend
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html: htmlContent,
        text: textContent || undefined,
        replyTo: REPLY_TO_EMAIL
      })

      console.log(`Email sent successfully: ${templateKey} to ${to}`)

      await logEmailFlow({
        emailType: tracking?.emailType ?? templateKey,
        recipient: to,
        subject,
        status: 'sent',
        recipientType: tracking?.recipientType ?? null,
        sentBy: tracking?.sentBy ?? null,
        fallbackSentBy: tracking?.fallbackSentBy ?? null,
        resendEmailId: result.data?.id ?? null,
      })

      return { success: true, result, subject }
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error'
      await logEmailFlow({
        emailType: tracking?.emailType ?? templateKey,
        recipient: to,
        subject,
        status: 'failed',
        error: errorMessage,
        recipientType: tracking?.recipientType ?? null,
        sentBy: tracking?.sentBy ?? null,
        fallbackSentBy: tracking?.fallbackSentBy ?? null,
        resendEmailId: null,
      })
      throw sendError
    }
  } catch (error) {
    console.error('Error sending email from template:', error)
    throw error
  }
}

/**
 * Check if an email trigger is enabled
 */
export async function isEmailTriggerEnabled(triggerKey: string): Promise<boolean> {
  try {
    const trigger = await db.emailTrigger.findUnique({
      where: { triggerKey }
    })
    return trigger?.isEnabled || false
  } catch (error) {
    console.error('Error checking email trigger:', error)
    return false
  }
}

/**
 * Send verification email prompting the user to confirm address
 */
export async function sendVerificationEmail(
  params: { name: string; email: string; verificationLink: string },
  tracking?: { sentBy?: string | null; recipientType?: string | null }
) {
  const { name, email, verificationLink } = params
  return sendEmailFromTemplate({
    templateKey: 'verify_email',
    to: email,
    variables: {
      name: name || email,
      verificationLink,
    },
    checkTrigger: 'user_email_verification',
    tracking: {
      emailType: 'user_email_verification',
      recipientType: tracking?.recipientType ?? 'user',
      sentBy: tracking?.sentBy ?? null,
    },
  })
}

/**
 * Send welcome email to new user
 * Now uses database template - editable from admin dashboard!
 */
export async function sendWelcomeEmail(
  user: { name: string; email: string; role: string },
  tracking?: { sentBy?: string | null; recipientType?: string | null }
) {
  return sendEmailFromTemplate({
    templateKey: 'welcome_user',
    to: user.email,
    variables: {
      name: user.name || user.email
    },
    checkTrigger: 'user_registration',
    tracking: {
      emailType: 'welcome_user',
      recipientType: tracking?.recipientType ?? 'user',
      sentBy: tracking?.sentBy ?? null,
    },
  })
}
