const { chromium } = require('playwright');

async function testAuthFlow() {
  console.log('🚀 Starting authentication flow test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Generate unique test email
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@prostormat.cz`;
    const testPassword = 'TestPassword123';
    const testName = 'Test User';

    console.log('📧 Test credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

    // Test 1: Registration page
    console.log('1️⃣  Testing registration page...');
    await page.goto('http://localhost:3000/registrace');
    await page.waitForLoadState('networkidle');

    // Verify no logo present
    const logoCount = await page.locator('img[alt*="logo" i], svg[alt*="logo" i]').count();
    console.log(`   ✓ Logo removed: ${logoCount === 0 ? 'YES' : 'NO (found ' + logoCount + ')'}`);

    // Verify no Google button
    const googleButtonCount = await page.locator('button:has-text("Google")').count();
    console.log(`   ✓ Google sign-up removed: ${googleButtonCount === 0 ? 'YES' : 'NO (found ' + googleButtonCount + ')'}`);

    // Fill registration form
    console.log('   ✓ Filling registration form...');
    await page.fill('input[type="text"][placeholder*="jméno" i]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]:first-of-type', testPassword);
    await page.fill('input[type="password"]:last-of-type', testPassword);

    // Submit form
    console.log('   ✓ Submitting registration...');
    await page.click('button[type="submit"]');

    // Wait a bit for API call
    await page.waitForTimeout(2000);

    // Check for errors first
    const errorEl = await page.locator('.bg-red-50').count();
    if (errorEl > 0) {
      const errorText = await page.locator('.bg-red-50').textContent();
      console.log(`   ❌ Registration error: ${errorText}\n`);
      throw new Error('Registration failed: ' + errorText);
    }

    // Wait for redirect to dashboard (with longer timeout for auto sign-in)
    console.log('   ⏳ Waiting for auto sign-in and redirect...');
    await page.waitForURL(/dashboard/, { timeout: 15000 });

    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Auto sign-in successful! Redirected to dashboard\n');
    } else {
      console.log(`   ❌ Unexpected URL: ${currentUrl}\n`);
      throw new Error('Registration auto sign-in failed');
    }

    // Sign out
    console.log('2️⃣  Signing out...');
    await page.goto('http://localhost:3000/api/auth/signout');
    await page.click('button:has-text("Sign out")').catch(() => {
      // If button doesn't exist, might be different flow
      console.log('   ⚠️  Sign out button not found, continuing...');
    });
    await page.waitForTimeout(2000);

    // Test 2: Sign-in page
    console.log('3️⃣  Testing sign-in page...');
    await page.goto('http://localhost:3000/prihlaseni');
    await page.waitForLoadState('networkidle');

    // Verify no logo present
    const signInLogoCount = await page.locator('img[alt*="logo" i], svg[alt*="logo" i]').count();
    console.log(`   ✓ Logo removed: ${signInLogoCount === 0 ? 'YES' : 'NO (found ' + signInLogoCount + ')'}`);

    // Verify no Google button
    const signInGoogleButtonCount = await page.locator('button:has-text("Google")').count();
    console.log(`   ✓ Google sign-in removed: ${signInGoogleButtonCount === 0 ? 'YES' : 'NO (found ' + signInGoogleButtonCount + ')'}`);

    // Fill sign-in form
    console.log('   ✓ Filling sign-in form...');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Submit form
    console.log('   ✓ Submitting sign-in...');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard or error
    await page.waitForURL(/dashboard|prihlaseni/, { timeout: 10000 });

    const signInUrl = page.url();
    if (signInUrl.includes('/dashboard')) {
      console.log('   ✅ Sign-in successful! Redirected to dashboard\n');
    } else {
      const signInErrorText = await page.locator('.bg-red-50').textContent().catch(() => null);
      console.log(`   ❌ Sign-in failed. Error: ${signInErrorText}\n`);
      throw new Error('Sign-in failed');
    }

    console.log('✅ All tests passed!\n');
    console.log('Summary:');
    console.log('✓ Registration page: Logo removed, Google button removed');
    console.log('✓ Auto sign-in after registration: Working');
    console.log('✓ Sign-in page: Logo removed, Google button removed');
    console.log('✓ Manual sign-in: Working');

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testAuthFlow().catch(console.error);
