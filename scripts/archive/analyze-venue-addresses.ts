import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

const prisma = new PrismaClient()

interface AddressIssue {
  id: string
  name: string
  currentAddress: string
  cleanedAddress: string
  issueType: string[]
}

async function analyzeVenueAddresses() {
  console.log('🔍 Analyzing venue addresses...\n')

  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      district: true
    }
  })

  console.log(`📊 Total venues with addresses: ${venues.length}\n`)

  const issues: AddressIssue[] = []

  for (const venue of venues) {
    if (!venue.address) continue

    const issueTypes: string[] = []
    let cleanedAddress = venue.address

    // Check for trailing comma/spaces
    if (/,\s*$/.test(venue.address)) {
      issueTypes.push('Trailing comma')
      cleanedAddress = cleanedAddress.replace(/,\s*$/, '')
    }

    // Check for Praha/Prague patterns
    if (/, ?(Praha|Prague)/.test(venue.address)) {
      issueTypes.push('District in address')
      // Pattern 1: ", Praha, <anything>" or ", Prague, <anything>"
      cleanedAddress = cleanedAddress.replace(/, (Praha|Prague),.*$/, '')
      // Pattern 2: ", Praha" or ", Prague" at end
      cleanedAddress = cleanedAddress.replace(/, (Praha|Prague)[^,]*$/, '')
    }

    // Trim whitespace
    cleanedAddress = cleanedAddress.trim()

    // If address changed, record the issue
    if (cleanedAddress !== venue.address) {
      issues.push({
        id: venue.id,
        name: venue.name,
        currentAddress: venue.address,
        cleanedAddress,
        issueType: issueTypes
      })
    }
  }

  // Report findings
  console.log(`\n📋 ANALYSIS RESULTS`)
  console.log(`═══════════════════════════════════════════════════════════\n`)

  console.log(`✅ Clean addresses: ${venues.length - issues.length}`)
  console.log(`⚠️  Addresses with issues: ${issues.length}\n`)

  if (issues.length > 0) {
    console.log(`📝 ISSUES BREAKDOWN:`)
    const trailingCommas = issues.filter(i => i.issueType.includes('Trailing comma')).length
    const districtInAddress = issues.filter(i => i.issueType.includes('District in address')).length

    console.log(`   - Trailing commas: ${trailingCommas}`)
    console.log(`   - District in address: ${districtInAddress}\n`)

    console.log(`\n🔎 EXAMPLES (showing first 10):\n`)

    for (const issue of issues.slice(0, 10)) {
      console.log(`📍 ${issue.name}`)
      console.log(`   Issues: ${issue.issueType.join(', ')}`)
      console.log(`   Current:  "${issue.currentAddress}"`)
      console.log(`   Cleaned:  "${issue.cleanedAddress}"`)
      console.log(``)
    }

    if (issues.length > 10) {
      console.log(`   ... and ${issues.length - 10} more\n`)
    }

    console.log(`\n💾 READY FOR CLEANUP`)
    console.log(`═══════════════════════════════════════════════════════════`)
    console.log(`Run 'npx tsx scripts/cleanup-venue-addresses.ts' to apply fixes\n`)
  } else {
    console.log(`\n✨ All addresses are clean! No action needed.\n`)
  }

  await prisma.$disconnect()
}

analyzeVenueAddresses().catch(console.error)
