/**
 * Registration Flow Bug Detection Script
 *
 * Audits the registration and email verification flow for known issues:
 * 1. Session cookie name mismatch between dev/prod
 * 2. Router.refresh() timing issues
 * 3. Welcome page handling of missing session
 * 4. Email triggers and templates enabled
 * 5. Token expiration configuration
 *
 * Usage:
 *   npx tsx scripts/check-registration-bugs.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Try to import db, but don't fail if DATABASE_URL is not set
let db: any = null
let isEmailTriggerEnabled: any = null
let isEmailTemplateActive: any = null

try {
  const dbModule = require('@/lib/db')
  db = dbModule.db
  const utils = require('../tests/helpers/registration-test-utils')
  isEmailTriggerEnabled = utils.isEmailTriggerEnabled
  isEmailTemplateActive = utils.isEmailTemplateActive
} catch (error) {
  console.log('⚠️  Database not available - skipping database checks')
  console.log('   (This is OK - static code analysis will still run)\n')
}

interface BugCheck {
  name: string
  passed: boolean
  severity: 'critical' | 'warning' | 'info'
  details: string
  file?: string
  line?: number
}

const checks: BugCheck[] = []

function logCheck(name: string, severity: 'critical' | 'warning' | 'info' = 'info') {
  console.log(`\n🔍 Checking: ${name}`)
  return { name, severity }
}

function pass(check: { name: string; severity: string }, details: string, file?: string, line?: number) {
  console.log(`  ✅ ${details}`)
  checks.push({ ...check, passed: true, details, file, line } as BugCheck)
}

function fail(check: { name: string; severity: string }, details: string, file?: string, line?: number) {
  const icon = check.severity === 'critical' ? '❌' : '⚠️'
  console.log(`  ${icon} ${details}`)
  checks.push({ ...check, passed: false, details, file, line } as BugCheck)
}

/**
 * Check 1: Cookie name consistency in verify-email route
 */
async function checkCookieNameConsistency() {
  const check = logCheck('Cookie Name Consistency', 'critical')

  const verifyEmailPath = path.join(
    process.cwd(),
    'src/app/api/auth/verify-email/route.ts'
  )

  try {
    const content = fs.readFileSync(verifyEmailPath, 'utf-8')
    const lines = content.split('\n')

    // Find cookie name logic
    const cookieNameLines = lines
      .map((line, idx) => ({ line, idx: idx + 1 }))
      .filter((item) => item.line.includes('next-auth.session-token'))

    if (cookieNameLines.length === 0) {
      fail(
        check,
        'Could not find cookie name logic in verify-email route',
        verifyEmailPath
      )
      return
    }

    // Check for environment-specific cookie names
    const hasProdCookie = content.includes('__Secure-next-auth.session-token')
    const hasDevCookie = content.includes('next-auth.session-token')
    const hasEnvCheck = content.includes('NODE_ENV') && content.includes('production')

    if (hasProdCookie && hasDevCookie && hasEnvCheck) {
      pass(
        check,
        'Cookie names correctly differentiated between dev and prod',
        verifyEmailPath,
        cookieNameLines[0].idx
      )
    } else {
      fail(
        check,
        'Cookie naming may not properly handle dev vs prod environments',
        verifyEmailPath,
        cookieNameLines[0].idx
      )
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Check 2: Router refresh timing in verify-email-page
 */
async function checkRouterRefreshTiming() {
  const check = logCheck('Router Refresh Timing', 'warning')

  const verifyPagePath = path.join(
    process.cwd(),
    'src/components/pages/auth/verify-email-page.tsx'
  )

  try {
    const content = fs.readFileSync(verifyPagePath, 'utf-8')
    const lines = content.split('\n')

    // Find router.refresh() call
    const refreshLine = lines.findIndex((line) => line.includes('router.refresh()'))

    if (refreshLine === -1) {
      fail(check, 'router.refresh() not found in verify-email-page', verifyPagePath)
      return
    }

    // Find setTimeout after refresh
    const nextLines = lines.slice(refreshLine, refreshLine + 5).join('\n')
    const hasTimeout = nextLines.includes('setTimeout')
    // Use [\s\S] to match across newlines
    const timeoutMatch = nextLines.match(/setTimeout[\s\S]*?(\d+)/)
    const delay = timeoutMatch ? parseInt(timeoutMatch[1]) : 0

    if (hasTimeout && delay >= 1000) {
      pass(
        check,
        `Found ${delay}ms delay after router.refresh() - should be sufficient for session propagation`,
        verifyPagePath,
        refreshLine + 1
      )
    } else if (hasTimeout && delay < 1000) {
      fail(
        check,
        `Short delay (${delay}ms) after router.refresh() may cause race condition`,
        verifyPagePath,
        refreshLine + 1
      )
    } else {
      fail(
        check,
        'No delay after router.refresh() - may cause race condition with session cookie',
        verifyPagePath,
        refreshLine + 1
      )
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Check 3: Welcome page handles missing session
 */
async function checkWelcomePageSessionHandling() {
  const check = logCheck('Welcome Page Session Handling', 'warning')

  const welcomePath = path.join(process.cwd(), 'src/app/vitejte/page.tsx')

  try {
    const content = fs.readFileSync(welcomePath, 'utf-8')
    const lines = content.split('\n')

    // Check if getServerSession is used
    const hasGetSession = content.includes('getServerSession')

    if (!hasGetSession) {
      fail(
        check,
        'Welcome page does not fetch session - may not show user data',
        welcomePath
      )
      return
    }

    // Check if there's fallback for missing session
    const hasFallback =
      content.includes('||') ||
      content.includes('??') ||
      content.includes('Prostorťáku')

    if (hasFallback) {
      pass(
        check,
        'Welcome page has fallback for missing/incomplete session',
        welcomePath
      )
    } else {
      fail(
        check,
        'Welcome page may crash if session is not available',
        welcomePath
      )
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Check 4: Email triggers enabled
 */
async function checkEmailTriggers() {
  const check = logCheck('Email Triggers Enabled', 'critical')

  if (!db || !isEmailTriggerEnabled) {
    console.log('  ⏭️  Skipped (database not available)')
    return
  }

  try {
    const verificationTrigger = await isEmailTriggerEnabled('user_email_verification')
    const welcomeTrigger = await isEmailTriggerEnabled('user_registration')

    if (verificationTrigger && welcomeTrigger) {
      pass(check, 'All registration email triggers are enabled')
    } else {
      const disabled = []
      if (!verificationTrigger) disabled.push('user_email_verification')
      if (!welcomeTrigger) disabled.push('user_registration')

      fail(check, `Email triggers disabled: ${disabled.join(', ')}`)
    }
  } catch (error) {
    fail(check, `Error checking email triggers: ${error}`)
  }
}

/**
 * Check 5: Email templates active
 */
async function checkEmailTemplates() {
  const check = logCheck('Email Templates Active', 'critical')

  if (!db || !isEmailTemplateActive) {
    console.log('  ⏭️  Skipped (database not available)')
    return
  }

  try {
    const verifyTemplate = await isEmailTemplateActive('verify_email')
    const welcomeTemplate = await isEmailTemplateActive('welcome_user')

    if (verifyTemplate && welcomeTemplate) {
      pass(check, 'All registration email templates are active')
    } else {
      const inactive = []
      if (!verifyTemplate) inactive.push('verify_email')
      if (!welcomeTemplate) inactive.push('welcome_user')

      fail(check, `Email templates inactive: ${inactive.join(', ')}`)
    }
  } catch (error) {
    fail(check, `Error checking email templates: ${error}`)
  }
}

/**
 * Check 6: Token expiration configuration
 */
async function checkTokenExpiration() {
  const check = logCheck('Token Expiration Configuration', 'info')

  const emailVerificationPath = path.join(
    process.cwd(),
    'src/lib/email-verification.ts'
  )

  try {
    const content = fs.readFileSync(emailVerificationPath, 'utf-8')

    // Find default expiration
    const defaultMatch = content.match(/DEFAULT_EXPIRATION_HOURS\s*=\s*(\d+)/)
    const defaultHours = defaultMatch ? parseInt(defaultMatch[1]) : null

    if (defaultHours) {
      if (defaultHours >= 24 && defaultHours <= 72) {
        pass(
          check,
          `Token expiration is ${defaultHours} hours (reasonable timeframe)`,
          emailVerificationPath
        )
      } else if (defaultHours < 24) {
        fail(
          check,
          `Token expiration is ${defaultHours} hours (may be too short for users)`,
          emailVerificationPath
        )
      } else {
        fail(
          check,
          `Token expiration is ${defaultHours} hours (security concern - too long)`,
          emailVerificationPath
        )
      }
    } else {
      fail(check, 'Could not determine token expiration configuration', emailVerificationPath)
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Check 7: NextAuth secret is configured
 */
async function checkNextAuthSecret() {
  const check = logCheck('NextAuth Secret Configuration', 'critical')

  if (process.env.NEXTAUTH_SECRET) {
    pass(check, 'NEXTAUTH_SECRET is configured')
  } else {
    fail(check, 'NEXTAUTH_SECRET is not set - session creation will fail')
  }
}

/**
 * Check 8: Session cookie attributes
 */
async function checkSessionCookieAttributes() {
  const check = logCheck('Session Cookie Security Attributes', 'warning')

  const verifyEmailPath = path.join(
    process.cwd(),
    'src/app/api/auth/verify-email/route.ts'
  )

  try {
    const content = fs.readFileSync(verifyEmailPath, 'utf-8')

    // Check for httpOnly
    const hasHttpOnly = content.includes('httpOnly: true')

    // Check for secure based on environment
    const hasSecure = content.includes('secure:') && content.includes('NODE_ENV')

    // Check for sameSite
    const hasSameSite = content.includes('sameSite:')

    const issues = []
    if (!hasHttpOnly) issues.push('httpOnly not set')
    if (!hasSecure) issues.push('secure flag not environment-aware')
    if (!hasSameSite) issues.push('sameSite not configured')

    if (issues.length === 0) {
      pass(
        check,
        'Session cookie has proper security attributes (httpOnly, secure, sameSite)',
        verifyEmailPath
      )
    } else {
      fail(
        check,
        `Session cookie missing security attributes: ${issues.join(', ')}`,
        verifyEmailPath
      )
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Check 9: Error handling in verification API
 */
async function checkVerificationErrorHandling() {
  const check = logCheck('Verification API Error Handling', 'info')

  const verifyEmailPath = path.join(
    process.cwd(),
    'src/app/api/auth/verify-email/route.ts'
  )

  try {
    const content = fs.readFileSync(verifyEmailPath, 'utf-8')

    // Check for proper error responses
    const hasExpiredError = content.includes('expired')
    const hasNotFoundError = content.includes('not_found')
    const hasUserNotFoundError = content.includes('user_not_found')

    if (hasExpiredError && hasNotFoundError && hasUserNotFoundError) {
      pass(
        check,
        'Verification API handles all error cases (expired, not_found, user_not_found)',
        verifyEmailPath
      )
    } else {
      const missing = []
      if (!hasExpiredError) missing.push('expired token')
      if (!hasNotFoundError) missing.push('token not found')
      if (!hasUserNotFoundError) missing.push('user not found')

      fail(
        check,
        `Verification API missing error handling for: ${missing.join(', ')}`,
        verifyEmailPath
      )
    }
  } catch (error) {
    fail(check, `Error reading file: ${error}`)
  }
}

/**
 * Main audit runner
 */
async function runAudit() {
  console.log('🔍 Starting Registration Flow Bug Detection Audit')
  console.log('=' .repeat(60))

  await checkCookieNameConsistency()
  await checkRouterRefreshTiming()
  await checkWelcomePageSessionHandling()
  await checkEmailTriggers()
  await checkEmailTemplates()
  await checkTokenExpiration()
  await checkNextAuthSecret()
  await checkSessionCookieAttributes()
  await checkVerificationErrorHandling()

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Bug Detection Summary')
  console.log('='.repeat(60))

  const passed = checks.filter((c) => c.passed).length
  const failed = checks.filter((c) => !c.passed).length
  const total = checks.length

  const critical = checks.filter((c) => !c.passed && c.severity === 'critical')
  const warnings = checks.filter((c) => !c.passed && c.severity === 'warning')
  const info = checks.filter((c) => !c.passed && c.severity === 'info')

  console.log(`\nTotal Checks: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)

  if (critical.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES (${critical.length}):`)
    critical.forEach((check) => {
      console.log(`   - ${check.name}: ${check.details}`)
      if (check.file) {
        console.log(`     File: ${check.file}${check.line ? `:${check.line}` : ''}`)
      }
    })
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`)
    warnings.forEach((check) => {
      console.log(`   - ${check.name}: ${check.details}`)
      if (check.file) {
        console.log(`     File: ${check.file}${check.line ? `:${check.line}` : ''}`)
      }
    })
  }

  if (info.length > 0) {
    console.log(`\nℹ️  INFO (${info.length}):`)
    info.forEach((check) => {
      console.log(`   - ${check.name}: ${check.details}`)
      if (check.file) {
        console.log(`     File: ${check.file}${check.line ? `:${check.line}` : ''}`)
      }
    })
  }

  console.log('='.repeat(60))

  if (critical.length > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND - MUST BE FIXED')
    process.exit(1)
  } else if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS FOUND - SHOULD BE REVIEWED')
    process.exit(0)
  } else {
    console.log('\n✅ ALL CHECKS PASSED')
    process.exit(0)
  }
}

// Run audit
runAudit().catch((error) => {
  console.error('Fatal error during audit:', error)
  process.exit(1)
})
