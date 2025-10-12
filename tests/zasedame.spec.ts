import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Zasedame Venue', () => {
  test('should display images on Zasedame venue page', async ({ page }) => {
    await page.goto(`${BASE_URL}/prostory/zasedame-cz`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find all images that contain 'zasedame-cz' in their src
    const images = page.locator('img[src*="zasedame-cz"]');
    const imageCount = await images.count();

    console.log(`Found ${imageCount} images for Zasedame`);

    // Verify we have images
    expect(imageCount).toBeGreaterThan(0);
    expect(imageCount).toBeLessThanOrEqual(24);

    // Verify at least the first image loads successfully
    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      // Check the image src contains the expected path
      const src = await firstImage.getAttribute('src');
      expect(src).toContain('zasedame-cz');
    }
  });
});
