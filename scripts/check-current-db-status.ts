import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING
    }
  }
})

async function main() {
  console.log('=== CHECKING DATABASE CONNECTION ===\n')
  console.log('Using connection:', process.env.POSTGRES_URL_NON_POOLING?.replace(/:[^:@]+@/, ':****@'))
  console.log('')

  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      description: true
    }
  })

  console.log('=== DATABASE STATUS ===')
  console.log(`Total venues in database: ${allVenues.length}`)

  const enhanced = allVenues.filter(v => v.description && v.description.length >= 600)
  const needWork = allVenues.filter(v => !v.description || v.description.length < 600)

  console.log(`Enhanced (600+ chars): ${enhanced.length} (${((enhanced.length / allVenues.length) * 100).toFixed(1)}%)`)
  console.log(`Still need work (<600 chars): ${needWork.length} (${((needWork.length / allVenues.length) * 100).toFixed(1)}%)`)

  console.log('\n=== BREAKDOWN OF VENUES NEEDING WORK ===')
  const veryShort = needWork.filter(v => !v.description || v.description.length < 100)
  const short = needWork.filter(v => v.description && v.description.length >= 100 && v.description.length < 600)

  console.log(`Very short (<100 chars): ${veryShort.length}`)
  console.log(`Short (100-599 chars): ${short.length}`)

  console.log('\n=== SAMPLE OF VENUES NEEDING WORK ===')
  needWork.slice(0, 20).forEach(v => {
    const len = v.description?.length || 0
    console.log(`${v.slug.padEnd(50)} | ${len.toString().padStart(3)} chars`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
