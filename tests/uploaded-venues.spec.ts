import { test, expect } from '@playwright/test';

test.describe('Uploaded venue images', () => {
  const venuesToTest = [
    { slug: 'ribs-of-prague', name: 'Ribs of Prague', expectedMinImages: 5 },
    { slug: 'spejle-jungmannova', name: 'Špejle Jungmannova', expectedMinImages: 8 },
    { slug: 'hard-rock-cafe-praha_1.patro-lounge', name: 'Hard Rock Cafe Praha - 1.patro Lounge', expectedMinImages: 20 },
    { slug: 'prague-city-golf-vinor_restaurace-soul.ad', name: 'Prague City Golf - Restaurace Soul.ad', expectedMinImages: 20 },
  ];

  for (const venue of venuesToTest) {
    test(`should display images for ${venue.name}`, async ({ page }) => {
      // Navigate to venue page
      await page.goto(`/prostory/${venue.slug}`);

      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check page title
      const pageTitle = await page.title();
      console.log(`Page title: ${pageTitle}`);
      expect(pageTitle).toContain(venue.name.split(' - ')[0].split('@')[0]);

      // Check that images are present
      const images = page.locator(`img[src*="${venue.slug}"]`);

      // Wait for at least one image to be visible
      const imageCount = await images.count();
      console.log(`Found ${imageCount} images for ${venue.name}`);

      expect(imageCount).toBeGreaterThanOrEqual(1);

      // Wait for first image to load
      if (imageCount > 0) {
        await expect(images.first()).toBeVisible({ timeout: 10000 });

        // Verify first image loads correctly
        const firstImage = images.first();
        const src = await firstImage.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).toContain(venue.slug);
        console.log(`First image: ${src}`);
      }
    });
  }

  test('summary: all uploaded venues have images', async ({ page }) => {
    const results = [];

    for (const venue of venuesToTest) {
      await page.goto(`/prostory/${venue.slug}`);
      await page.waitForLoadState('domcontentloaded');

      const images = page.locator(`img[src*="${venue.slug}"]`);
      const count = await images.count();

      results.push({ name: venue.name, count });
      console.log(`✓ ${venue.name}: ${count} images`);
    }

    // Verify all venues have images
    results.forEach(result => {
      expect(result.count).toBeGreaterThan(0);
    });

    console.log(`\nTotal venues verified: ${results.length}`);
    console.log(`Total images: ${results.reduce((sum, r) => sum + r.count, 0)}`);
  });
});
