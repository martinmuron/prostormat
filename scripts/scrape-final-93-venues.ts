import { readFileSync, writeFileSync } from 'fs'
import * as cheerio from 'cheerio'

const venues = JSON.parse(readFileSync('actual-remaining-93-venues.json', 'utf-8'))

async function scrapePage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) return ''
    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove noise
    $('script, style, nav, header, footer, iframe, noscript').remove()

    // Try to find about/o-nas page
    let aboutUrl = ''
    $('a[href*="o-nas"], a[href*="about"], a[href*="o-firme"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !aboutUrl) {
        aboutUrl = new URL(href, url).toString()
      }
    })

    let content = $('body').text().replace(/\s+/g, ' ').trim()

    // If found about page, scrape it too
    if (aboutUrl && aboutUrl !== url) {
      try {
        const aboutResponse = await fetch(aboutUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(10000)
        })
        if (aboutResponse.ok) {
          const aboutHtml = await aboutResponse.text()
          const $about = cheerio.load(aboutHtml)
          $about('script, style, nav, header, footer').remove()
          content += ' ' + $about('body').text().replace(/\s+/g, ' ').trim()
        }
      } catch {}
    }

    return content.slice(0, 8000)
  } catch {
    return ''
  }
}

async function main() {
  console.log(`🌐 Scraping ${venues.length} venues...\n`)

  const scraped = []
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i]
    console.log(`[${i + 1}/${venues.length}] ${venue.slug}`)

    let content = ''
    if (venue.websiteUrl) {
      content = await scrapePage(venue.websiteUrl)
      console.log(`  ✅ Scraped ${content.length} chars`)
      await new Promise(r => setTimeout(r, 500))
    }

    scraped.push({
      ...venue,
      scrapedContent: content
    })
  }

  writeFileSync('scraped-final-93-venues.json', JSON.stringify(scraped, null, 2))
  console.log(`\n✅ Saved to scraped-final-93-venues.json`)
}

main().catch(console.error)
