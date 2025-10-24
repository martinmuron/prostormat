const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Navigating to Le Valmont detail page...');
  await page.goto('http://localhost:3002/prostory/le-valmont-club-lounge', { waitUntil: 'networkidle' });

  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({
    path: 'valmont-detail-page.png',
    fullPage: true
  });

  console.log('📸 Screenshot saved: valmont-detail-page.png');
  console.log('✨ Check if images are loading on the detail page!');

  await browser.close();
})();
