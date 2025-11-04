/**
 * Registration Flow Test Utilities
 *
 * Shared helper functions for testing user registration and email verification flow
 */

import { db } from '@/lib/db'
import crypto from 'crypto'

export interface TestUser {
  email: string
  password: string
  name?: string
}

/**
 * Generate a unique test user with timestamp to avoid conflicts
 */
export function createTestUser(prefix: string = 'test'): TestUser {
  const timestamp = Date.now()
  const randomStr = crypto.randomBytes(4).toString('hex')
  return {
    email: `${prefix}-${timestamp}-${randomStr}@test-prostormat.cz`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  }
}

/**
 * Extract verification token from database for a given email
 * @returns token string or null if not found
 */
export async function extractVerificationToken(email: string): Promise<string | null> {
  try {
    const token = await db.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' },
    })
    return token?.token || null
  } catch (error) {
    console.error('Error extracting verification token:', error)
    return null
  }
}

/**
 * Wait for email to be sent and logged in EmailFlowLog
 * Polls database for up to maxAttempts * delayMs
 */
export async function waitForEmailSent(
  recipient: string,
  emailType: string,
  maxAttempts: number = 10,
  delayMs: number = 500
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const log = await db.emailFlowLog.findFirst({
      where: {
        recipient,
        emailType,
        status: 'sent',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (log) {
      return true
    }

    await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  return false
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  return user?.emailVerified !== null
}

/**
 * Cleanup test user and related data from database
 * Use this in afterEach/afterAll to clean up test data
 */
export async function cleanupTestUser(email: string): Promise<void> {
  try {
    // Delete in order to avoid foreign key constraints

    // 1. Delete email flow logs
    await db.emailFlowLog.deleteMany({
      where: { recipient: email },
    })

    // 2. Delete verification tokens
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // 3. Get user to delete related records
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (user) {
      // 4. Delete email flow logs sent by user
      await db.emailFlowLog.deleteMany({
        where: { sentBy: user.id },
      })

      // 5. Delete user's venue broadcasts
      await db.venueBroadcastLog.deleteMany({
        where: {
          broadcast: {
            userId: user.id
          }
        },
      })

      await db.venueBroadcast.deleteMany({
        where: { userId: user.id },
      })

      // 6. Delete user's venue inquiries
      await db.venueInquiry.deleteMany({
        where: { userId: user.id },
      })

      // 7. Delete user's sessions
      await db.session.deleteMany({
        where: { userId: user.id },
      })

      // 8. Delete user's accounts
      await db.account.deleteMany({
        where: { userId: user.id },
      })

      // 9. Finally delete the user
      await db.user.delete({
        where: { email },
      })
    }

    console.log(`✅ Cleaned up test user: ${email}`)
  } catch (error) {
    console.error(`❌ Error cleaning up test user ${email}:`, error)
    throw error
  }
}

/**
 * Validate session cookie format and attributes
 */
export function validateSessionCookie(cookie: {
  name: string
  value: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  maxAge?: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check cookie name matches environment
  const expectedName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'

  if (cookie.name !== expectedName) {
    errors.push(
      `Cookie name mismatch: expected "${expectedName}", got "${cookie.name}"`
    )
  }

  // Check value is not empty
  if (!cookie.value || cookie.value.trim() === '') {
    errors.push('Cookie value is empty')
  }

  // Check httpOnly flag
  if (cookie.httpOnly !== true) {
    errors.push('Cookie should have httpOnly=true for security')
  }

  // Check secure flag in production
  if (process.env.NODE_ENV === 'production' && cookie.secure !== true) {
    errors.push('Cookie should have secure=true in production')
  }

  // Check sameSite
  if (cookie.sameSite && cookie.sameSite !== 'lax' && cookie.sameSite !== 'strict') {
    errors.push(`Cookie sameSite should be "lax" or "strict", got "${cookie.sameSite}"`)
  }

  // Check maxAge is reasonable (should be ~30 days)
  const expectedMaxAge = 30 * 24 * 60 * 60 // 30 days in seconds
  if (cookie.maxAge && Math.abs(cookie.maxAge - expectedMaxAge) > 60 * 60) {
    errors.push(
      `Cookie maxAge seems incorrect: expected ~${expectedMaxAge}s, got ${cookie.maxAge}s`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create an expired verification token for testing
 */
export async function createExpiredVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Check if email trigger is enabled
 */
export async function isEmailTriggerEnabled(triggerKey: string): Promise<boolean> {
  try {
    const trigger = await db.emailTrigger.findUnique({
      where: { triggerKey },
    })
    return trigger?.isEnabled ?? false
  } catch (error) {
    console.error('Error checking email trigger:', error)
    return false
  }
}

/**
 * Check if email template is active
 */
export async function isEmailTemplateActive(templateKey: string): Promise<boolean> {
  try {
    const template = await db.emailTemplate.findUnique({
      where: { templateKey },
    })
    return template?.isActive ?? false
  } catch (error) {
    console.error('Error checking email template:', error)
    return false
  }
}

/**
 * Get all email logs for a specific recipient
 */
export async function getEmailLogs(recipient: string) {
  return await db.emailFlowLog.findMany({
    where: { recipient },
    orderBy: { createdAt: 'desc' },
  })
}
