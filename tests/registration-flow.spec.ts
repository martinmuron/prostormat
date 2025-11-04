/**
 * Registration Flow End-to-End Test
 *
 * Tests the complete user registration flow in a real browser:
 * 1. User visits registration page
 * 2. Fills out registration form
 * 3. Submits registration
 * 4. Gets verification token from database
 * 5. Visits verification link
 * 6. Gets automatically logged in
 * 7. Redirected to welcome page
 * 8. Welcome page displays user information
 */

import { test, expect, Page } from '@playwright/test'
import {
  createTestUser,
  extractVerificationToken,
  waitForEmailSent,
  cleanupTestUser,
  getUserByEmail,
  isEmailVerified,
} from './helpers/registration-test-utils'

test.describe('Registration Flow E2E', () => {
  let testUser: { email: string; password: string; name?: string }

  test.beforeEach(() => {
    testUser = createTestUser('e2e')
  })

  test.afterEach(async () => {
    // Cleanup test user after each test
    if (testUser?.email) {
      await cleanupTestUser(testUser.email)
    }
  })

  test('Complete registration flow - happy path', async ({ page, context }) => {
    // Step 1: Navigate to registration page
    await test.step('Navigate to registration', async () => {
      await page.goto('/registrace')
      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/.*registrace/)
    })

    // Step 2: Fill out registration form
    await test.step('Fill registration form', async () => {
      // Find and fill email field
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()
      await emailInput.fill(testUser.email)

      // Find and fill password field
      const passwordInput = page.locator('input[type="password"]').first()
      await expect(passwordInput).toBeVisible()
      await passwordInput.fill(testUser.password)

      // Check if there's a confirm password field
      const confirmPasswordInput = page.locator('input[placeholder*="znovu"]')
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill(testUser.password)
      }
    })

    // Step 3: Submit registration
    await test.step('Submit registration', async () => {
      // Find and click submit button
      const submitButton = page.locator('button[type="submit"]').filter({
        hasText: /registr|vytvořit|účet/i,
      })
      await expect(submitButton).toBeVisible()
      await submitButton.click()

      // Wait for success message or redirect
      await page.waitForTimeout(1000)

      // Check for success message
      const successMessage = page.locator('text=/registrace.*úspěšn|poslali.*email/i')
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible({ timeout: 5000 })
        console.log('✅ Registration success message displayed')
      }
    })

    // Step 4: Verify user created and email sent
    await test.step('Verify user created in database', async () => {
      const user = await getUserByEmail(testUser.email)
      expect(user).not.toBeNull()
      expect(user?.email).toBe(testUser.email)
      expect(user?.emailVerified).toBeNull() // Should not be verified yet
      console.log(`✅ User created: ${user?.id}`)
    })

    await test.step('Verify verification email sent', async () => {
      const emailSent = await waitForEmailSent(
        testUser.email,
        'user_registration_verification',
        20,
        500
      )
      expect(emailSent).toBe(true)
      console.log('✅ Verification email sent')
    })

    // Step 5: Get verification token and visit verification link
    let verificationToken: string | null = null

    await test.step('Extract verification token', async () => {
      verificationToken = await extractVerificationToken(testUser.email)
      expect(verificationToken).not.toBeNull()
      console.log(`✅ Verification token: ${verificationToken?.substring(0, 10)}...`)
    })

    // Step 6: Visit verification link
    await test.step('Visit verification link', async () => {
      if (!verificationToken) {
        throw new Error('No verification token available')
      }

      // Navigate to verification page
      await page.goto(`/potvrdit-email?token=${verificationToken}`)
      await page.waitForLoadState('domcontentloaded')

      // Wait for verification to complete
      await page.waitForTimeout(2000)

      // Check for success message
      const successText = page.locator('text=/ověřen|verified|úspěšně/i')
      await expect(successText).toBeVisible({ timeout: 10000 })
      console.log('✅ Verification page showed success message')
    })

    // Step 7: Verify user is logged in (check session cookie)
    await test.step('Verify session cookie set', async () => {
      const cookies = await context.cookies()
      const sessionCookie = cookies.find((c) =>
        c.name.includes('next-auth.session-token')
      )

      expect(sessionCookie).toBeDefined()
      expect(sessionCookie?.value).toBeTruthy()
      expect(sessionCookie?.httpOnly).toBe(true)
      console.log(`✅ Session cookie set: ${sessionCookie?.name}`)
    })

    // Step 8: Verify email verified in database
    await test.step('Verify email verified in database', async () => {
      const verified = await isEmailVerified(testUser.email)
      expect(verified).toBe(true)
      console.log('✅ Email verified in database')
    })

    // Step 9: Wait for redirect to welcome page
    await test.step('Redirect to welcome page', async () => {
      // Wait for redirect (up to 5 seconds)
      await page.waitForURL(/.*vitejte/, { timeout: 5000 })
      expect(page.url()).toContain('/vitejte')
      console.log('✅ Redirected to /vitejte')
    })

    // Step 10: Verify welcome page shows user data
    await test.step('Welcome page shows user data', async () => {
      await page.waitForLoadState('domcontentloaded')

      // Check for welcome message
      const welcomeHeading = page.locator('h1, h2').filter({
        hasText: /vítejte|welcome/i,
      })
      await expect(welcomeHeading).toBeVisible()

      // Check if user email or name is displayed
      const userIdentifier = page.locator(`text=${testUser.email}`)
      await expect(userIdentifier).toBeVisible({ timeout: 5000 })
      console.log('✅ Welcome page displays user information')

      // Verify CTAs are present
      const browseButton = page.locator('a[href="/prostory"]')
      await expect(browseButton).toBeVisible()

      const quickRequestButton = page.locator('a[href="/rychla-poptavka"]')
      await expect(quickRequestButton).toBeVisible()

      console.log('✅ Welcome page CTAs displayed')
    })

    // Step 11: Verify welcome email sent
    await test.step('Verify welcome email sent', async () => {
      const emailSent = await waitForEmailSent(testUser.email, 'welcome_email', 20, 500)
      expect(emailSent).toBe(true)
      console.log('✅ Welcome email sent')
    })
  })

  test('Registration with existing email shows error', async ({ page }) => {
    // First, create the user through API
    const response = await fetch(`${page.context().baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })

    expect(response.ok).toBe(true)

    // Now try to register again through UI
    await page.goto('/registrace')
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(testUser.email)

    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill(testUser.password)

    const confirmPasswordInput = page.locator('input[placeholder*="znovu"]')
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill(testUser.password)
    }

    const submitButton = page.locator('button[type="submit"]').filter({
      hasText: /registr|vytvořit|účet/i,
    })
    await submitButton.click()

    // Wait for error message
    await page.waitForTimeout(1000)

    const errorMessage = page.locator('text=/existuje|already exists/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
    console.log('✅ Duplicate email error displayed')
  })

  test('Invalid verification token shows error', async ({ page }) => {
    const invalidToken = 'invalid-token-12345'

    await page.goto(`/potvrdit-email?token=${invalidToken}`)
    await page.waitForLoadState('domcontentloaded')

    // Wait for error processing
    await page.waitForTimeout(2000)

    // Look for error message
    const errorMessage = page.locator(
      'text=/nesprávný|chyb|invalid|failed|nezdařilo/i'
    )
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
    console.log('✅ Invalid token error displayed')
  })

  test('Verification page without token shows error', async ({ page }) => {
    await page.goto('/potvrdit-email')
    await page.waitForLoadState('domcontentloaded')

    // Wait for error processing
    await page.waitForTimeout(1000)

    // Look for error message about missing token
    const errorMessage = page.locator('text=/chyb|odkaz|znovu/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
    console.log('✅ Missing token error displayed')
  })

  test('Session persists after page reload', async ({ page, context }) => {
    // First, complete registration flow quickly using API
    const registerResponse = await fetch(`${page.context().baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })
    expect(registerResponse.ok).toBe(true)

    // Wait for email
    await waitForEmailSent(testUser.email, 'user_registration_verification', 20, 500)

    // Get token
    const token = await extractVerificationToken(testUser.email)
    expect(token).not.toBeNull()

    // Verify email via API and get session cookie
    const verifyResponse = await fetch(`${page.context().baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    expect(verifyResponse.ok).toBe(true)

    // Set the session cookie in the browser context
    const setCookieHeader = verifyResponse.headers.get('set-cookie')
    if (setCookieHeader) {
      const cookieName =
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token'

      const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;]+)`))
      if (match) {
        await context.addCookies([
          {
            name: cookieName,
            value: match[1],
            domain: new URL(page.context().baseURL || 'http://localhost:3000')
              .hostname,
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
          },
        ])
      }
    }

    // Navigate to welcome page
    await page.goto('/vitejte')
    await page.waitForLoadState('domcontentloaded')

    // Verify user sees their data
    const userEmail = page.locator(`text=${testUser.email}`)
    await expect(userEmail).toBeVisible()

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Verify user is still logged in
    await expect(userEmail).toBeVisible()
    console.log('✅ Session persisted after page reload')
  })
})
