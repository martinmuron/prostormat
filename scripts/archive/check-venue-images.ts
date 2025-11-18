#!/usr/bin/env tsx

import { chromium } from 'playwright'

const BASE_URL = process.env.CHECK_BASE_URL || 'https://prostormat-epkmlyb27-future-developments.vercel.app'

const VENUE_SLUGS = [
  'atma-community-space',
  'turnovska-pivnice-brumlovka',
  'kafkoff'
]

async function checkVenue(slug: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const url = `${BASE_URL}/prostory/${slug}`
  await page.goto(url, { waitUntil: 'networkidle' })

  const imageHandles = await page.locator('img[alt*=" - obrázek"]').all()
  const validImages = []

  for (const handle of imageHandles) {
    const alt = await handle.getAttribute('alt')
    const src = await handle.getAttribute('src')
    const size = await handle.evaluate((img) => ({ width: (img as HTMLImageElement).naturalWidth, height: (img as HTMLImageElement).naturalHeight }))
    if ((size?.width || 0) > 0 && (size?.height || 0) > 0 && src && !src.includes('placeholder')) {
      validImages.push({ alt, src })
    }
  }

  await browser.close()

  if (validImages.length === 0) {
    throw new Error(`No valid images found for ${slug} (${url})`)
  }

  console.log(`✅ ${slug}: ${validImages[0].src}`)
}

async function run() {
  for (const slug of VENUE_SLUGS) {
    await checkVenue(slug)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
