import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 CHECKING VENUE COUNTS\n')
  console.log('='.repeat(60))

  // Total venues in database
  const totalVenues = await prisma.venue.count()
  console.log(`\n📊 Total venues in database: ${totalVenues}`)

  // Parent venues only (parentId = null)
  const parentVenues = await prisma.venue.count({
    where: { parentId: null }
  })
  console.log(`📊 Parent venues (parentId = null): ${parentVenues}`)

  // Sub-venues (parentId NOT null)
  const subVenues = await prisma.venue.count({
    where: { parentId: { not: null } }
  })
  console.log(`📊 Sub-venues (parentId NOT null): ${subVenues}`)

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Total: ${parentVenues} parent + ${subVenues} sub-venues = ${totalVenues} venues`)

  // Show breakdown by status for parent venues
  console.log('\n📋 Parent Venue Status Breakdown:\n')
  const statusGroups = await prisma.venue.groupBy({
    by: ['status'],
    where: { parentId: null },
    _count: true
  })

  statusGroups.forEach(group => {
    console.log(`  ${group.status}: ${group._count}`)
  })

  // Show some examples of venues with sub-venues
  console.log('\n\n📁 Examples of Parent Venues with Sub-venues:\n')
  const parentsWithSubs = await prisma.venue.findMany({
    where: {
      subVenues: {
        some: {}
      }
    },
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          subVenues: true
        }
      }
    },
    take: 10
  })

  parentsWithSubs.forEach(parent => {
    console.log(`  ${parent.name} - ${parent._count.subVenues} sub-venues`)
  })

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ ANALYSIS COMPLETE')
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
