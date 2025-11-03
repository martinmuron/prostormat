import { randomUUID } from 'crypto'
import { prisma } from './prisma'

/**
 * Get admin user ID for system-generated emails
 * This ensures EmailFlowLog foreign key constraints are satisfied
 *
 * @returns Admin user ID or null if no admin found
 */
export async function getAdminUserIdForSystemEmails(): Promise<string | null> {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    })

    return admin?.id ?? null
  } catch (error) {
    console.error('Failed to get admin user for system emails:', error)
    return null
  }
}

/**
 * Safely get sentBy user ID with fallback to admin
 * Ensures we never use non-existent user IDs that violate FK constraints
 *
 * @param preferredUserId - Preferred user ID (e.g., from session)
 * @param fallbackUserId - Fallback user ID (e.g., venue manager)
 * @returns Valid user ID or null
 */
export async function getSafeSentByUserId(
  preferredUserId?: string | null,
  fallbackUserId?: string | null
): Promise<string | null> {
  if (preferredUserId) return preferredUserId
  if (fallbackUserId) return fallbackUserId

  // Fall back to admin user for system emails
  return getAdminUserIdForSystemEmails()
}

interface EmailFlowLogParams {
  emailType: string
  recipient: string
  subject: string
  status: string
  error?: string | null
  recipientType?: string | null
  sentBy?: string | null
  fallbackSentBy?: string | null
  resendEmailId?: string | null
}

export async function logEmailFlow({
  emailType,
  recipient,
  subject,
  status,
  error,
  recipientType,
  sentBy,
  fallbackSentBy,
  resendEmailId,
}: EmailFlowLogParams): Promise<void> {
  try {
    const userId = await getSafeSentByUserId(sentBy, fallbackSentBy)

    if (!userId) {
      console.error('Unable to determine user for EmailFlowLog entry', {
        emailType,
        recipient,
        subject,
        status,
      })
      return
    }

    await prisma.emailFlowLog.create({
      data: {
        id: randomUUID(),
        emailType,
        recipient,
        subject,
        status,
        error: error ?? null,
        recipientType: recipientType ?? null,
        sentBy: userId,
        resendEmailId: resendEmailId ?? null,
      },
    })
  } catch (logError) {
    console.error('Failed to write EmailFlowLog entry:', logError)
  }
}
