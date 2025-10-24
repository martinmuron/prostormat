const { chromium } = require('playwright');

async function testAuthFlowDebug() {
  console.log('🚀 Starting authentication flow test with debugging...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs and errors from the browser
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`   ⚠️ Browser console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`   ❌ Browser JavaScript error: ${error.message}`);
  });

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

    // Take screenshot before filling
    await page.screenshot({ path: 'debug-1-loaded.png' });
    console.log('   ✓ Screenshot saved: debug-1-loaded.png');

    // Verify no logo present
    const logoCount = await page.locator('img[alt*="logo" i], svg[alt*="logo" i]').count();
    console.log(`   ✓ Logo removed: ${logoCount === 0 ? 'YES' : 'NO (found ' + logoCount + ')'}`);

    // Verify no Google button
    const googleButtonCount = await page.locator('button:has-text("Google")').count();
    console.log(`   ✓ Google sign-up removed: ${googleButtonCount === 0 ? 'YES' : 'NO (found ' + googleButtonCount + ')'}`);

    // Fill registration form
    console.log('   ✓ Filling registration form...');

    // Find and fill name field
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill(testName);
    console.log('   ✓ Name field filled');

    // Find and fill email field
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    console.log('   ✓ Email field filled');

    // Find and fill password fields
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(testPassword);
    console.log('   ✓ First password field filled');

    await passwordFields.nth(1).fill(testPassword);
    console.log('   ✓ Confirm password field filled');

    // Take screenshot after filling
    await page.screenshot({ path: 'debug-2-filled.png' });
    console.log('   ✓ Screenshot saved: debug-2-filled.png');

    // Check if submit button exists and is enabled
    const submitButton = page.locator('button[type="submit"]');
    const submitButtonCount = await submitButton.count();
    console.log(`   ✓ Submit button found: ${submitButtonCount > 0 ? 'YES' : 'NO'}`);

    if (submitButtonCount > 0) {
      const isDisabled = await submitButton.isDisabled();
      const isVisible = await submitButton.isVisible();
      console.log(`   ✓ Submit button disabled: ${isDisabled}`);
      console.log(`   ✓ Submit button visible: ${isVisible}`);

      const buttonText = await submitButton.textContent();
      console.log(`   ✓ Submit button text: "${buttonText}"`);
    }

    // Wait a moment for any validation to complete
    await page.waitForTimeout(500);

    // Listen for network requests to catch the registration API call
    let registrationCalled = false;
    page.on('request', request => {
      if (request.url().includes('/api/auth/register')) {
        console.log(`   📡 Registration API called: ${request.url()}`);
        registrationCalled = true;
      }
    });

    // Submit form
    console.log('   ✓ Clicking submit button...');
    await submitButton.click();
    console.log('   ✓ Submit button clicked');

    // Wait a bit for the request to be made
    await page.waitForTimeout(3000);

    console.log(`   ✓ Registration API was called: ${registrationCalled ? 'YES' : 'NO'}`);

    // Take screenshot after submission
    await page.screenshot({ path: 'debug-3-after-submit.png' });
    console.log('   ✓ Screenshot saved: debug-3-after-submit.png');

    // Check current URL
    const currentUrl = page.url();
    console.log(`   ✓ Current URL: ${currentUrl}`);

    // Check for errors on page
    const errorEl = await page.locator('.bg-red-50').count();
    if (errorEl > 0) {
      const errorText = await page.locator('.bg-red-50').textContent();
      console.log(`   ⚠️ Error message shown: ${errorText}`);
    }

    // Wait a bit longer to see if redirect happens
    console.log('   ⏳ Waiting to see if redirect happens...');
    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    console.log(`   ✓ Final URL: ${finalUrl}`);

    // Take final screenshot
    await page.screenshot({ path: 'debug-4-final.png' });
    console.log('   ✓ Screenshot saved: debug-4-final.png');

    if (finalUrl.includes('/dashboard')) {
      console.log('   ✅ Auto sign-in successful! Redirected to dashboard\n');
    } else {
      console.log(`   ⚠️ Still on registration page or unexpected location\n`);
    }

    console.log('\n📸 Debug screenshots saved:');
    console.log('   - debug-1-loaded.png (initial page load)');
    console.log('   - debug-2-filled.png (form filled)');
    console.log('   - debug-3-after-submit.png (after clicking submit)');
    console.log('   - debug-4-final.png (final state)');

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
    console.log('   ✓ Error screenshot saved: debug-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

testAuthFlowDebug().catch(console.error);
