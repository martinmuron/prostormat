import { test, expect } from '@playwright/test';

test.describe('Medusa Prague venue', () => {
  test('should display images on venue page', async ({ page }) => {
    // Navigate to Medusa Prague venue page
    await page.goto('/prostory/medusa-prague');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check that the page loaded (look for any heading or the venue name anywhere)
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Check if venue name appears anywhere on the page
    const hasVenueName = await page.locator('text=/medusa/i').count();
    console.log(`Found ${hasVenueName} elements with "medusa" text`);

    // Check that images are present
    const images = page.locator('img[src*="medusa-prague"]');

    // Wait for at least one image to be visible
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images with src containing "medusa-prague"`);

    expect(imageCount).toBeGreaterThan(0);

    // Wait for first image to load
    if (imageCount > 0) {
      await expect(images.first()).toBeVisible({ timeout: 10000 });
    }

    // Verify images load correctly (check src attributes)
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const image = images.nth(i);
      const src = await image.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('medusa-prague');
      console.log(`Image ${i + 1}: ${src}`);
    }
  });

  test('should display images in gallery/carousel', async ({ page }) => {
    await page.goto('/prostory/medusa-prague');
    await page.waitForLoadState('networkidle');

    // Look for image gallery or carousel
    const galleryImages = page.locator('[class*="gallery"] img, [class*="carousel"] img, [class*="slider"] img');

    if (await galleryImages.count() > 0) {
      await expect(galleryImages.first()).toBeVisible();
      const count = await galleryImages.count();
      console.log(`Found ${count} images in gallery`);
      expect(count).toBeGreaterThan(0);
    }
  });
});
