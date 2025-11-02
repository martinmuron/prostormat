import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n====================================')
  console.log('   VENUE CATEGORIZATION REPORT')
  console.log('====================================\n')

  // Get all venues
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      venueType: true,
      venueTypes: true,
      paid: true,
      isRecommended: true,
      priority: true,
      contactEmail: true,
      manager: {
        select: {
          role: true
        }
      }
    }
  })

  const total = allVenues.length

  // 1. STATUS BREAKDOWN
  console.log('📊 VENUE STATUS BREAKDOWN\n')
  const statusMap = new Map<string, number>()
  allVenues.forEach(v => {
    statusMap.set(v.status, (statusMap.get(v.status) || 0) + 1)
  })

  console.log('Total venues:', total)
  console.log('\nBy status:')
  Array.from(statusMap.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      console.log(`  ${status.padEnd(15)} ${count.toString().padStart(4)} venues (${percentage}%)`)
    })

  // 2. VENUE TYPE BREAKDOWN (venueType field - DEPRECATED)
  console.log('\n\n📍 DEPRECATED VENUE TYPE (venueType) - Single Category\n')
  const oldTypeMap = new Map<string, number>()
  allVenues.forEach(v => {
    const type = v.venueType || 'null'
    oldTypeMap.set(type, (oldTypeMap.get(type) || 0) + 1)
  })

  Array.from(oldTypeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([type, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      console.log(`  ${type.padEnd(30)} ${count.toString().padStart(4)} venues (${percentage}%)`)
    })

  // 3. VENUE TYPES BREAKDOWN (venueTypes array - CURRENT)
  console.log('\n\n🏢 CURRENT VENUE TYPES (venueTypes) - Multiple Categories\n')
  const typeFrequency = new Map<string, number>()
  allVenues.forEach(v => {
    if (v.venueTypes && v.venueTypes.length > 0) {
      v.venueTypes.forEach(type => {
        typeFrequency.set(type, (typeFrequency.get(type) || 0) + 1)
      })
    } else {
      typeFrequency.set('[empty]', (typeFrequency.get('[empty]') || 0) + 1)
    }
  })

  console.log('Unique venue type tags:', typeFrequency.size - 1) // -1 for [empty]
  console.log('\nTop venue types:')
  Array.from(typeFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .forEach(([type, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      console.log(`  ${type.padEnd(30)} ${count.toString().padStart(4)} venues (${percentage}%)`)
    })

  // 4. PAYMENT STATUS
  console.log('\n\n💰 PAYMENT STATUS\n')
  const paidCount = allVenues.filter(v => v.paid).length
  const unpaidCount = total - paidCount
  console.log(`  Paid:         ${paidCount.toString().padStart(4)} venues (${((paidCount/total)*100).toFixed(1)}%)`)
  console.log(`  Unpaid:       ${unpaidCount.toString().padStart(4)} venues (${((unpaidCount/total)*100).toFixed(1)}%)`)

  // 5. RECOMMENDED/FEATURED
  console.log('\n\n⭐ FEATURED/RECOMMENDED STATUS\n')
  const recommendedCount = allVenues.filter(v => v.isRecommended).length
  const regularCount = total - recommendedCount
  console.log(`  Recommended:  ${recommendedCount.toString().padStart(4)} venues (${((recommendedCount/total)*100).toFixed(1)}%)`)
  console.log(`  Regular:      ${regularCount.toString().padStart(4)} venues (${((regularCount/total)*100).toFixed(1)}%)`)

  // 6. PRIORITY BREAKDOWN
  console.log('\n\n🎯 PRIORITY BREAKDOWN\n')
  const priorityMap = new Map<string, number>()
  allVenues.forEach(v => {
    const priority = v.priority !== null ? `Priority ${v.priority}` : 'No priority'
    priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1)
  })

  Array.from(priorityMap.entries())
    .sort((a, b) => {
      if (a[0] === 'No priority') return 1
      if (b[0] === 'No priority') return -1
      return a[0].localeCompare(b[0])
    })
    .forEach(([priority, count]) => {
      const percentage = ((count / total) * 100).toFixed(1)
      console.log(`  ${priority.padEnd(20)} ${count.toString().padStart(4)} venues (${percentage}%)`)
    })

  // 7. CONTACT EMAIL STATUS
  console.log('\n\n📧 CONTACT EMAIL STATUS\n')
  const withEmail = allVenues.filter(v => v.contactEmail && v.contactEmail.trim() !== '').length
  const withoutEmail = total - withEmail
  console.log(`  With email:   ${withEmail.toString().padStart(4)} venues (${((withEmail/total)*100).toFixed(1)}%)`)
  console.log(`  Without:      ${withoutEmail.toString().padStart(4)} venues (${((withoutEmail/total)*100).toFixed(1)}%)`)

  // 8. VENUES WITHOUT CATEGORIES
  console.log('\n\n⚠️  VENUES WITHOUT CATEGORIES\n')
  const withoutCategories = allVenues.filter(v => !v.venueTypes || v.venueTypes.length === 0)
  console.log(`  Venues without venueTypes: ${withoutCategories.length}`)

  if (withoutCategories.length > 0 && withoutCategories.length <= 10) {
    console.log('\nVenues missing categories:')
    withoutCategories.forEach(v => {
      console.log(`  - ${v.name} (${v.status})`)
    })
  }

  console.log('\n====================================\n')

  await prisma.$disconnect()
}

main().catch(console.error)
