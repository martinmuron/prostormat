import { readFileSync } from 'fs'

const data = JSON.parse(readFileSync('scraped-remaining-venues.json', 'utf-8'))

console.log('=== REMAINING VENUES ANALYSIS ===\n')
console.log(`Total venues: ${data.length}`)

const withContent = data.filter((v: any) => v.scrapedContent && v.scrapedContent.length > 100)
const noContent = data.filter((v: any) => !v.scrapedContent || v.scrapedContent.length <= 100)

console.log(`With scraped content (>100 chars): ${withContent.length}`)
console.log(`No/minimal content: ${noContent.length}`)

// Group by description length
const veryShort = data.filter((v: any) => !v.description || v.description.length < 100)
const short = data.filter((v: any) => v.description && v.description.length >= 100 && v.description.length < 600)
const enhanced = data.filter((v: any) => v.description && v.description.length >= 600)

console.log('\n=== CURRENT DESCRIPTION STATUS ===')
console.log(`Very short (<100 chars): ${veryShort.length}`)
console.log(`Short (100-599 chars): ${short.length}`)
console.log(`Already enhanced (600+ chars): ${enhanced.length}`)

console.log('\n=== VENUES WITHOUT WEBSITES ===')
const noWebsite = data.filter((v: any) => !v.websiteUrl)
console.log(`Total without website: ${noWebsite.length}`)

console.log('\n=== SAMPLE OF VENUES WITH NO SCRAPED CONTENT ===')
noContent.slice(0, 15).forEach((v: any) => {
  const descLen = v.description ? v.description.length : 0
  console.log(`${v.slug.padEnd(50)} | Desc: ${descLen.toString().padStart(3)} | ${v.websiteUrl || 'NO WEBSITE'}`)
})

console.log('\n=== VENUES ALREADY AT 600+ CHARS (CAN BE SKIPPED) ===')
console.log(`Count: ${enhanced.length}`)
if (enhanced.length > 0) {
  enhanced.slice(0, 5).forEach((v: any) => {
    console.log(`${v.slug} - ${v.description.length} chars`)
  })
}

console.log('\n=== RECOMMENDATIONS ===')
console.log(`1. Process ${withContent.length} venues with scraped content first`)
console.log(`2. For ${noContent.length} venues with no content, use template-based generation`)
console.log(`3. Skip ${enhanced.length} venues that already have 600+ character descriptions`)
console.log(`4. Actual work needed: ${data.length - enhanced.length} venues`)
