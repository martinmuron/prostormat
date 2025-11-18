import { chromium } from 'playwright';

async function testMobileLayout() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  });

  const page = await context.newPage();

  try {
    console.log('📱 Testing Mobile Layout\n');
    console.log('Device: iPhone SE (375x667)\n');

    // Test Homepage
    console.log('=== HOMEPAGE ===');
    await page.goto('https://prostormat-4v1n52rhz-future-developments.vercel.app');
    await page.waitForLoadState('networkidle');

    // Take screenshot of hero section
    await page.screenshot({ path: '/tmp/mobile-hero.png', fullPage: false });
    console.log('✅ Screenshot saved: /tmp/mobile-hero.png');

    // Check hero filters
    const heroFilters = await page.locator('.hero-search, [class*="hero"]').first();
    const heroBox = await heroFilters.boundingBox();
    console.log(`Hero section dimensions: ${heroBox?.width}x${heroBox?.height}`);

    // Check search input
    const searchInput = await page.locator('input[type="text"], input[placeholder*="Hledat"]').first();
    const inputBox = await searchInput.boundingBox();
    console.log(`Search input width: ${inputBox?.width}px (viewport: 375px)`);
    if (inputBox && inputBox.width < 300) {
      console.log('⚠️  Search input not full width');
    }

    // Check dropdowns
    const selects = await page.locator('select').all();
    console.log(`\nFound ${selects.length} dropdowns`);
    for (let i = 0; i < selects.length; i++) {
      const box = await selects[i].boundingBox();
      console.log(`  Dropdown ${i + 1}: ${box?.width}px wide`);
      if (box && box.width < 300) {
        console.log(`  ⚠️  Dropdown ${i + 1} not full width`);
      }
    }

    // Check buttons
    const buttons = await page.locator('button:visible').all();
    console.log(`\nFound ${buttons.length} visible buttons`);
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const box = await buttons[i].boundingBox();
      const text = await buttons[i].textContent();
      console.log(`  Button "${text?.trim().substring(0, 30)}...": ${box?.width}px wide`);
    }

    // Test Venues Page
    console.log('\n\n=== VENUES PAGE ===');
    await page.goto('https://prostormat-4v1n52rhz-future-developments.vercel.app/prostory');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/mobile-venues.png', fullPage: false });
    console.log('✅ Screenshot saved: /tmp/mobile-venues.png');

    // Check filter section
    const filterSection = await page.locator('[class*="filter"]').first();
    const filterBox = await filterSection.boundingBox();
    console.log(`Filter section width: ${filterBox?.width}px`);

    // Check venue cards
    const venueCards = await page.locator('[class*="card"], article').all();
    console.log(`\nFound ${venueCards.length} venue cards`);
    if (venueCards.length > 0) {
      const firstCard = await venueCards[0].boundingBox();
      console.log(`First card width: ${firstCard?.width}px`);
    }

    // Test a venue detail page
    console.log('\n\n=== VENUE DETAIL PAGE ===');
    const firstVenueLink = await page.locator('a[href*="/prostory/"]').first();
    await firstVenueLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/mobile-venue-detail.png', fullPage: false });
    console.log('✅ Screenshot saved: /tmp/mobile-venue-detail.png');

    // Check contact form
    const formInputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
    console.log(`\nFound ${formInputs.length} form inputs`);
    for (let i = 0; i < Math.min(formInputs.length, 3); i++) {
      const box = await formInputs[i].boundingBox();
      console.log(`  Input ${i + 1}: ${box?.width}px wide`);
    }

    console.log('\n\n📊 SUMMARY');
    console.log('Screenshots saved to /tmp/');
    console.log('Review screenshots to see mobile layout issues');

  } catch (error) {
    console.error('Error during mobile testing:', error);
  } finally {
    await browser.close();
  }
}

testMobileLayout();
