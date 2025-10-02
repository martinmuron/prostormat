#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

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

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials are missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
}

const prisma = new PrismaClient()
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const BUCKET = 'venues'
const PREFIX = 'venue-images'
const MAX_IMAGES = 30

// If a venue doesn't have its own folder in storage, reuse another folder's imagery
const fallbackFolders: Record<string, string> = {
  'ox-prague-club': 'ox-club-prague',
  'multifunkcni-sal-jason': 'multifunkcni-mistnost',
}

async function syncImages() {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true
    }
  })

  const missing: string[] = []
  const updated: Array<{ slug: string; count: number }> = []

  for (const venue of venues) {
    const folderPath = `${PREFIX}/${venue.slug}`
    const listFromFolder = async (path: string) => supabase.storage.from(BUCKET).list(path, { limit: 100 })

    let { data, error } = await listFromFolder(folderPath)

    if ((!data || data.length === 0) && fallbackFolders[venue.slug]) {
      const fallbackPath = `${PREFIX}/${fallbackFolders[venue.slug]}`
      const fallbackResult = await listFromFolder(fallbackPath)
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        data = fallbackResult.data
        error = null
        console.log(`ℹ️  Using fallback images from ${fallbackPath} for ${venue.slug}`)
      }
    }

    if (error || !data || data.length === 0) {
      missing.push(`${venue.slug} (${venue.name})`)
      continue
    }

    const sortedFiles = data
      .filter((item) => item.name)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
      .slice(0, MAX_IMAGES)

    const urls = sortedFiles.map((file) => {
      const path = `${folderPath}/${file.name}`
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      return publicUrlData.publicUrl
    })

    await prisma.venue.update({
      where: { id: venue.id },
      data: { images: urls }
    })

    updated.push({ slug: venue.slug, count: urls.length })
    console.log(`✅ Synced ${venue.slug} (${urls.length} images)`) 
  }

  console.log('\n=== Sync summary ===')
  console.log(`Updated venues: ${updated.length}`)
  console.log(`Venues without storage images: ${missing.length}`)
  if (missing.length > 0) {
    missing.sort().forEach((item) => console.log(` - ${item}`))
  }
}

syncImages()
  .catch((error) => {
    console.error('Failed to sync venue images:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
