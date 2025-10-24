const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Navigating to venues page...');
  await page.goto('http://localhost:3002/prostory', { waitUntil: 'networkidle' });

  // Wait for venue cards to load
  await page.waitForTimeout(2000);

  // Find Le Valmont card
  const valmontCard = page.locator('text=Le Valmont').first();

  if (await valmontCard.count() > 0) {
    console.log('✅ Found Le Valmont card');

    // Scroll to the card
    await valmontCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: 'valmont-card-fixed.png',
      fullPage: false
    });

    console.log('📸 Screenshot saved: valmont-card-fixed.png');
    console.log('\n✨ Check if the main image now displays!');
  } else {
    console.log('❌ Le Valmont card not found on page');
  }

  await browser.close();
})();
