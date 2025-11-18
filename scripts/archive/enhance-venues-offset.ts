import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient()

const MIN_LENGTH = 600
const DELAY = 2000

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) return ''

    const html = await response.text()
    const $ = cheerio.load(html)
    $('script, style, nav, header, footer').remove()

    let content = ''
    for (const selector of ['main', 'article', '[class*="content"]', 'section', 'p']) {
      const text = $(selector).text().trim()
      if (text.length > content.length) content = text
    }

    return content.replace(/\s+/g, ' ').trim().slice(0, 3000)
  } catch {
    return ''
  }
}

function generateDescription(venue: any, web: string): string {
  let desc = venue.description || ''
  const types = venue.venueTypes.join(', ')
  const amenities = venue.amenities.join(', ')
  const cap = venue.capacitySeated || venue.capacityStanding || 0

  if (venue.district && !desc.includes(venue.district)) {
    desc += ` Nachází se v ${venue.district}.`
  }

  if (cap > 0) {
    const type = venue.capacitySeated ? 'k sezení' : 've stoje'
    desc += ` Kapacita až ${cap} osob ${type}.`
  }

  if (amenities.length > 10) {
    desc += ` K dispozici: ${amenities}.`
  }

  const webLower = web.slice(0, 500).toLowerCase()
  if (webLower.includes('historie')) desc += ' Bohatá historie prostoru.'
  if (webLower.includes('modern')) desc += ' Moderní vybavení.'
  if (webLower.includes('akce') || webLower.includes('event')) desc += ' Ideální pro firemní akce a oslavy.'
  if (webLower.includes('catering')) desc += ' Profesionální catering.'

  while (desc.length < MIN_LENGTH) {
    if (!desc.includes('profesionál')) desc += ' Profesionální zázemí a servis.'
    else if (!desc.includes('lokalita')) desc += ' Výhodná lokalita v Praze.'
    else { desc += ' Kontaktujte nás pro rezervaci.'; break }
  }

  return desc.trim()
}

async function main() {
  const offset = parseInt(process.argv.find(a => a.startsWith('--offset='))?.split('=')[1] || '0')
  const batch = parseInt(process.argv.find(a => a.startsWith('--batch='))?.split('=')[1] || '100')

  console.log(`\n🚀 Batch ${offset}-${offset + batch}`)

  const all = await prisma.venue.findMany({
    where: { status: 'active' },
    select: {
      id: true, name: true, slug: true, description: true, address: true,
      district: true, websiteUrl: true, venueTypes: true, amenities: true,
      capacitySeated: true, capacityStanding: true
    }
  })

  const venues = all.filter(v => !v.description || v.description.length < MIN_LENGTH).slice(offset, offset + batch)
  console.log(`Processing ${venues.length} venues\n`)

  let success = 0
  for (let i = 0; i < venues.length; i++) {
    const v = venues[i]
    console.log(`[${i + 1}/${venues.length}] ${v.name.slice(0, 40)}`)

    try {
      let web = ''
      if (v.websiteUrl) {
        web = await scrapeWebsite(v.websiteUrl)
        await new Promise(r => setTimeout(r, 1000))
      }

      const enhanced = generateDescription(v, web)
      await prisma.venue.update({ where: { id: v.id }, data: { description: enhanced } })
      console.log(`   ✅ ${enhanced.length} chars`)
      success++
    } catch (e) {
      console.error(`   ❌ Error`)
    }

    await new Promise(r => setTimeout(r, DELAY))
  }

  console.log(`\n✅ Success: ${success}/${venues.length}\n`)
  await prisma.$disconnect()
}

main()
