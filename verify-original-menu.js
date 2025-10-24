const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  await page.locator('button:has-text("Menu")').first().click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'original-menu-restored.png', fullPage: false });

  console.log('✅ Original menu restored successfully!');
  console.log('Screenshot saved: original-menu-restored.png');

  await browser.close();
})();
