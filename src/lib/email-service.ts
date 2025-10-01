import { db } from '@/lib/db'
import { resend } from '@/lib/resend'

interface SendEmailFromTemplateParams {
  templateKey: string
  to: string
  variables: Record<string, string>
  checkTrigger?: string
}

/**
 * Send email using database template with variable replacement
 */
export async function sendEmailFromTemplate({
  templateKey,
  to,
  variables,
  checkTrigger
}: SendEmailFromTemplateParams) {
  try {
    // Check if trigger is enabled (if specified)
    if (checkTrigger) {
      const trigger = await db.emailTrigger.findUnique({
        where: { triggerKey: checkTrigger }
      })

      if (!trigger || !trigger.isEnabled) {
        console.log(`Email trigger "${checkTrigger}" is disabled, skipping email`)
        return { success: false, reason: 'trigger_disabled' }
      }
    }

    // Get template from database
    const template = await db.emailTemplate.findUnique({
      where: { templateKey }
    })

    if (!template) {
      throw new Error(`Email template "${templateKey}" not found`)
    }

    if (!template.isActive) {
      console.log(`Email template "${templateKey}" is inactive, skipping email`)
      return { success: false, reason: 'template_inactive' }
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
    const result = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to,
      subject,
      html: htmlContent,
      text: textContent || undefined,
      reply_to: 'info@prostormat.cz'
    })

    console.log(`Email sent successfully: ${templateKey} to ${to}`)

    return { success: true, result }
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
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(user: { name: string; email: string; role: string }) {
  const templateKey = user.role === 'venue_manager'
    ? 'welcome_location_owner'
    : 'welcome_user'

  const triggerKey = user.role === 'venue_manager'
    ? 'venue_manager_registration'
    : 'user_registration'

  return sendEmailFromTemplate({
    templateKey,
    to: user.email,
    variables: {
      name: user.name || user.email,
      email: user.email
    },
    checkTrigger: triggerKey
  })
}
