import { chromium } from 'playwright';

async function testMobileFixed() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
  });

  const page = await context.newPage();

  try {
    console.log('📱 Testing Fixed Mobile Layout\n');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: '/tmp/mobile-hero-fixed.png', fullPage: false });
    console.log('✅ Screenshot saved: /tmp/mobile-hero-fixed.png');

    // Check all Select components
    const selects = await page.locator('[role="combobox"]').all();
    console.log(`\n📊 Found ${selects.length} Select components\n`);

    for (let i = 0; i < selects.length; i++) {
      const box = await selects[i].boundingBox();
      if (box) {
        const widthPercent = ((box.width / 375) * 100).toFixed(1);
        console.log(`  Select ${i + 1}: ${box.width}px wide (${widthPercent}% of viewport)`);
        if (box.width > 300) {
          console.log(`    ✅ Full width confirmed`);
        } else {
          console.log(`    ⚠️  Not full width`);
        }
      }
    }

    // Check submit button
    const submitBtn = await page.locator('button[type="submit"]').first();
    const btnBox = await submitBtn.boundingBox();
    if (btnBox) {
      const widthPercent = ((btnBox.width / 375) * 100).toFixed(1);
      console.log(`\n🔘 Submit Button: ${btnBox.width}px wide (${widthPercent}% of viewport)`);
      if (btnBox.width > 300) {
        console.log(`    ✅ Full width confirmed`);
      }
    }

    console.log('\n✨ Mobile layout test complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testMobileFixed();
