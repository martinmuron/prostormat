import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      contactEmail: true,
      status: true,
      manager: {
        select: {
          email: true,
        }
      }
    }
  })

  const total = allVenues.length
  const withContactEmail = allVenues.filter(v => v.contactEmail && v.contactEmail.trim() !== '').length
  const withoutContactEmail = total - withContactEmail

  const activeVenues = allVenues.filter(v => v.status === 'active')
  const activeWithContactEmail = activeVenues.filter(v => v.contactEmail && v.contactEmail.trim() !== '').length
  const activeWithoutContactEmail = activeVenues.length - activeWithContactEmail

  console.log('\n=== VENUE CONTACT EMAIL ANALYSIS ===\n')

  console.log('ALL VENUES:')
  console.log(`  Total: ${total}`)
  console.log(`  With contactEmail: ${withContactEmail} (${(withContactEmail/total*100).toFixed(1)}%)`)
  console.log(`  Without contactEmail: ${withoutContactEmail} (${(withoutContactEmail/total*100).toFixed(1)}%)`)

  console.log('\nACTIVE VENUES (status = "active"):')
  console.log(`  Total active: ${activeVenues.length}`)
  console.log(`  With contactEmail: ${activeWithContactEmail} (${(activeWithContactEmail/activeVenues.length*100).toFixed(1)}%)`)
  console.log(`  Without contactEmail: ${activeWithoutContactEmail} (${(activeWithoutContactEmail/activeVenues.length*100).toFixed(1)}%)`)

  console.log('\n=== BREAKDOWN BY STATUS ===\n')
  const statuses = ['active', 'published', 'draft', 'pending', 'hidden']
  for (const status of statuses) {
    const venues = allVenues.filter(v => v.status === status)
    if (venues.length > 0) {
      const withEmail = venues.filter(v => v.contactEmail && v.contactEmail.trim() !== '').length
      console.log(`${status}: ${withEmail}/${venues.length} have contactEmail (${(withEmail/venues.length*100).toFixed(1)}%)`)
    }
  }

  console.log('\n=== VENUES WITHOUT CONTACT EMAIL ===\n')
  const missingEmails = allVenues.filter(v => !v.contactEmail || v.contactEmail.trim() === '')

  if (missingEmails.length === 0) {
    console.log('✅ All venues have contact emails!')
  } else {
    console.log(`Found ${missingEmails.length} venues without contactEmail:\n`)
    missingEmails.slice(0, 20).forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`)
      console.log(`   Status: ${v.status}`)
      console.log(`   Manager email: ${v.manager?.email || 'N/A'}`)
      console.log(`   ID: ${v.id}\n`)
    })

    if (missingEmails.length > 20) {
      console.log(`... and ${missingEmails.length - 20} more`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
