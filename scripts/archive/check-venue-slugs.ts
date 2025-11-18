#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const remoteDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.')
  }

  process.env.DATABASE_URL = remoteDatabaseUrl
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSlugs() {
  const venues = await prisma.venue.findMany({
    select: {
      slug: true,
      name: true,
      parentId: true
    },
    orderBy: {
      slug: 'asc'
    }
  })

  console.log(`\nTotal venues: ${venues.length}\n`)

  // Group by parent/child
  const parents = venues.filter(v => !v.parentId)
  const children = venues.filter(v => v.parentId)

  console.log(`Parent venues: ${parents.length}`)
  console.log(`Child venues: ${children.length}\n`)

  console.log('All venue slugs:\n')
  venues.forEach(v => {
    const prefix = v.parentId ? '  └─ ' : ''
    console.log(`${prefix}${v.slug}`)
  })
}

checkSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
