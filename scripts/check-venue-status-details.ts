import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      contactEmail: true,
      status: true,
      paid: true,
      expiresAt: true,
      manager: {
        select: {
          email: true,
          role: true,
        }
      }
    }
  })

  console.log('\n=== VENUE STATUS DISTRIBUTION ===\n')

  const statusCounts = new Map<string, number>()
  allVenues.forEach(v => {
    statusCounts.set(v.status, (statusCounts.get(v.status) || 0) + 1)
  })

  console.log('Status breakdown:')
  Array.from(statusCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count} venues (${(count/allVenues.length*100).toFixed(1)}%)`)
    })

  console.log('\n=== PUBLISHED VENUES DETAILS ===\n')
  const publishedVenues = allVenues.filter(v => v.status === 'published')
  const paidPublished = publishedVenues.filter(v => v.paid).length
  const unpaidPublished = publishedVenues.filter(v => !v.paid).length

  console.log(`Published venues: ${publishedVenues.length}`)
  console.log(`  Paid: ${paidPublished}`)
  console.log(`  Unpaid: ${unpaidPublished}`)

  const now = new Date()
  const expiredPublished = publishedVenues.filter(v => v.expiresAt && new Date(v.expiresAt) < now).length
  console.log(`  Expired (expiresAt < now): ${expiredPublished}`)

  console.log('\n=== MANAGER ROLE BREAKDOWN ===\n')
  const managerRoles = new Map<string, number>()
  allVenues.forEach(v => {
    const role = v.manager?.role || 'no-manager'
    managerRoles.set(role, (managerRoles.get(role) || 0) + 1)
  })

  console.log('Venues by manager role:')
  Array.from(managerRoles.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
      console.log(`  ${role}: ${count} venues`)
    })

  await prisma.$disconnect()
}

main().catch(console.error)
