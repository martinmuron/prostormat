/**
 * Registration Flow API Testing Script
 *
 * Tests the complete user registration and email verification flow programmatically
 * Tests API endpoints directly without browser overhead
 *
 * Usage:
 *   npx tsx scripts/test-registration-flow.ts                    # Test local dev
 *   BASE_URL=https://prostormat.cz npx tsx scripts/test-registration-flow.ts  # Test production
 */

import { db } from '@/lib/db'
import {
  createTestUser,
  extractVerificationToken,
  waitForEmailSent,
  getUserByEmail,
  isEmailVerified,
  cleanupTestUser,
  isEmailTriggerEnabled,
  isEmailTemplateActive,
  getEmailLogs,
  createExpiredVerificationToken,
} from '../tests/helpers/registration-test-utils'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: string
}

const results: TestResult[] = []

function logTest(name: string) {
  console.log(`\n🧪 Testing: ${name}`)
}

function logSuccess(message: string) {
  console.log(`  ✅ ${message}`)
}

function logError(message: string) {
  console.log(`  ❌ ${message}`)
}

function logInfo(message: string) {
  console.log(`  ℹ️  ${message}`)
}

async function addResult(
  name: string,
  testFn: () => Promise<void>
): Promise<boolean> {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.push({ name, passed: true, duration })
    return true
  } catch (error) {
    const duration = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : String(error)
    results.push({ name, passed: false, duration, error: errorMessage })
    return false
  }
}

/**
 * Test 1: User Registration
 */
async function testUserRegistration(testUser: { email: string; password: string }) {
  logTest('User Registration API')

  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Registration failed: ${error.error || response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error('Registration response missing success flag')
  }

  if (!data.requiresEmailConfirmation) {
    throw new Error('Registration response missing requiresEmailConfirmation flag')
  }

  logSuccess(`User registered successfully: ${testUser.email}`)

  // Verify user exists in database
  const user = await getUserByEmail(testUser.email)
  if (!user) {
    throw new Error('User not found in database after registration')
  }
  logSuccess(`User found in database with ID: ${user.id}`)

  // Verify email is not yet verified
  if (user.emailVerified !== null) {
    throw new Error('Email should not be verified immediately after registration')
  }
  logSuccess('Email correctly marked as unverified')
}

/**
 * Test 2: Verification Email Sent
 */
async function testVerificationEmailSent(testUser: { email: string }) {
  logTest('Verification Email Sent')

  // Wait for email to be logged
  const emailSent = await waitForEmailSent(
    testUser.email,
    'user_registration_verification',
    20,
    500
  )

  if (!emailSent) {
    throw new Error('Verification email not found in EmailFlowLog')
  }

  logSuccess('Verification email logged in EmailFlowLog')

  // Verify token was created
  const token = await extractVerificationToken(testUser.email)
  if (!token) {
    throw new Error('Verification token not found in database')
  }

  logSuccess(`Verification token created: ${token.substring(0, 10)}...`)
}

/**
 * Test 3: Email Verification & Auto-Login
 */
async function testEmailVerification(testUser: { email: string }) {
  logTest('Email Verification & Auto-Login')

  // Get verification token
  const token = await extractVerificationToken(testUser.email)
  if (!token) {
    throw new Error('Cannot test verification without token')
  }

  // Call verification API
  const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Verification failed: ${error.error || response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error('Verification response missing success flag')
  }

  if (!data.user) {
    throw new Error('Verification response missing user object')
  }

  logSuccess(`Email verified successfully for: ${data.user.email}`)

  // Check if session cookie was set
  const cookies = response.headers.get('set-cookie')
  if (!cookies) {
    logError('⚠️  No Set-Cookie header in response - auto-login may fail!')
  } else {
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    if (cookies.includes(cookieName)) {
      logSuccess(`Session cookie "${cookieName}" was set in response`)
    } else {
      logError(`⚠️  Expected cookie "${cookieName}" not found in Set-Cookie header`)
    }
  }

  // Verify email is now verified in database
  const verified = await isEmailVerified(testUser.email)
  if (!verified) {
    throw new Error('Email not marked as verified in database')
  }
  logSuccess('Email verified status updated in database')

  // Verify token was consumed (deleted)
  const tokenAfter = await extractVerificationToken(testUser.email)
  if (tokenAfter) {
    throw new Error('Verification token should be deleted after use')
  }
  logSuccess('Verification token consumed and deleted')
}

/**
 * Test 4: Welcome Email Sent
 */
async function testWelcomeEmailSent(testUser: { email: string }) {
  logTest('Welcome Email Sent')

  // Wait for welcome email to be logged
  const emailSent = await waitForEmailSent(testUser.email, 'welcome_email', 20, 500)

  if (!emailSent) {
    throw new Error('Welcome email not found in EmailFlowLog')
  }

  logSuccess('Welcome email logged in EmailFlowLog')
}

/**
 * Test 5: Expired Token Handling
 */
async function testExpiredToken() {
  logTest('Expired Token Handling')

  const testUser = createTestUser('expired')

  // Create user manually
  const user = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      email: testUser.email,
      password: 'hashedpassword',
      name: testUser.email,
      role: 'user',
    },
  })

  // Create expired token
  const expiredToken = await createExpiredVerificationToken(testUser.email)
  logInfo(`Created expired token: ${expiredToken.substring(0, 10)}...`)

  // Try to verify with expired token
  const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: expiredToken }),
  })

  if (response.ok) {
    await cleanupTestUser(testUser.email)
    throw new Error('Expired token should not be accepted')
  }

  const error = await response.json()
  if (!error.error || !error.error.includes('vypršel')) {
    await cleanupTestUser(testUser.email)
    throw new Error(`Expected expiration error, got: ${error.error}`)
  }

  logSuccess('Expired token correctly rejected')

  // Cleanup
  await cleanupTestUser(testUser.email)
}

/**
 * Test 6: Invalid Token Handling
 */
async function testInvalidToken() {
  logTest('Invalid Token Handling')

  const invalidToken = 'invalid-token-12345'

  const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: invalidToken }),
  })

  if (response.ok) {
    throw new Error('Invalid token should not be accepted')
  }

  const error = await response.json()
  if (!error.error) {
    throw new Error('Expected error message for invalid token')
  }

  logSuccess('Invalid token correctly rejected')
}

/**
 * Test 7: Duplicate Registration
 */
async function testDuplicateRegistration(testUser: { email: string; password: string }) {
  logTest('Duplicate Registration Prevention')

  // Try to register with same email again
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  })

  if (response.ok) {
    throw new Error('Duplicate registration should be prevented')
  }

  const error = await response.json()
  if (!error.error || !error.error.includes('existuje')) {
    throw new Error(`Expected duplicate email error, got: ${error.error}`)
  }

  logSuccess('Duplicate registration correctly prevented')
}

/**
 * Test 8: Email Triggers & Templates
 */
async function testEmailConfiguration() {
  logTest('Email Triggers & Templates Configuration')

  // Check verification email trigger
  const verifyTrigger = await isEmailTriggerEnabled('user_email_verification')
  if (!verifyTrigger) {
    logError('⚠️  Email trigger "user_email_verification" is DISABLED')
  } else {
    logSuccess('Email trigger "user_email_verification" is enabled')
  }

  // Check welcome email trigger
  const welcomeTrigger = await isEmailTriggerEnabled('user_registration')
  if (!welcomeTrigger) {
    logError('⚠️  Email trigger "user_registration" is DISABLED')
  } else {
    logSuccess('Email trigger "user_registration" is enabled')
  }

  // Check verification email template
  const verifyTemplate = await isEmailTemplateActive('verify_email')
  if (!verifyTemplate) {
    logError('⚠️  Email template "verify_email" is INACTIVE')
  } else {
    logSuccess('Email template "verify_email" is active')
  }

  // Check welcome email template
  const welcomeTemplate = await isEmailTemplateActive('welcome_user')
  if (!welcomeTemplate) {
    logError('⚠️  Email template "welcome_user" is INACTIVE')
  } else {
    logSuccess('Email template "welcome_user" is active')
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Registration Flow API Tests')
  console.log(`📍 Testing against: ${BASE_URL}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('=' .repeat(60))

  let testUser = createTestUser('flow')

  try {
    // Pre-flight checks
    await addResult('Email Configuration Check', () => testEmailConfiguration())

    // Happy path tests
    await addResult('1. User Registration', () => testUserRegistration(testUser))

    await addResult('2. Verification Email Sent', () =>
      testVerificationEmailSent(testUser)
    )

    await addResult('3. Email Verification & Auto-Login', () =>
      testEmailVerification(testUser)
    )

    await addResult('4. Welcome Email Sent', () => testWelcomeEmailSent(testUser))

    await addResult('7. Duplicate Registration Prevention', () =>
      testDuplicateRegistration(testUser)
    )

    // Edge case tests
    await addResult('5. Expired Token Handling', () => testExpiredToken())

    await addResult('6. Invalid Token Handling', () => testInvalidToken())

    // Inspect email logs
    logTest('Email Flow Logs Inspection')
    const logs = await getEmailLogs(testUser.email)
    logInfo(`Found ${logs.length} email logs for test user:`)
    logs.forEach((log) => {
      console.log(
        `    - ${log.emailType} | ${log.status} | ${log.createdAt.toISOString()}`
      )
    })
  } catch (error) {
    console.error('\n💥 Fatal error during tests:', error)
  } finally {
    // Cleanup test user
    logTest('Cleanup')
    await cleanupTestUser(testUser.email)
    logSuccess('Test user and related data cleaned up')
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Results Summary')
  console.log('='.repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    const duration = `${result.duration}ms`
    console.log(`${icon} ${result.name} (${duration})`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
  })

  console.log('='.repeat(60))
  console.log(
    `Total: ${total} | Passed: ${passed} | Failed: ${failed} | Success Rate: ${Math.round((passed / total) * 100)}%`
  )

  if (failed > 0) {
    console.log('\n❌ TESTS FAILED')
    process.exit(1)
  } else {
    console.log('\n✅ ALL TESTS PASSED')
    process.exit(0)
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
