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
