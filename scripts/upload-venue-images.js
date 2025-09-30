#!/usr/bin/env node

const path = require('path')
const fs = require('fs/promises')
const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load environment variables in priority order
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

function ensureEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Prefer the remote Supabase connection for Prisma if available
const remoteDatabaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (remoteDatabaseUrl) {
    process.env.DATABASE_URL = remoteDatabaseUrl
  }
}

const SUPABASE_URL = ensureEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = ensureEnv('SUPABASE_SERVICE_ROLE_KEY')
const DATABASE_URL = ensureEnv('DATABASE_URL')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const prisma = new PrismaClient()

const IMAGE_ROOT = path.resolve(process.cwd(), 'Prostory', 'prostory_images')

const folderToSlugMap = {
  'alma-prague': 'alma-prague',
  'art-restaurant-manes': 'art-restaurant-manes',
  'arthurs': 'arthurs-pub',
  'bar-forbina': 'bar-forbina',
  'bar-monk-prague': 'bar-monk-prague',
  'bugsys-bar': 'bugsys-bar',
  'casablanca-sky-bar': 'casablanca-sky-bar',
  'cerveny-jelen': 'cerveny-jelen',
  'deer': 'deer-restaurant-prague',
  'forum-karlin': 'forum-karlin',
  'fu-club-prague': 'fu-club-prague',
  'hard-rock-cafe-praha': 'hard-rock-cafe-prague',
  'hotel-u-prince': 'hotel-u-prince',
  'kavarna-co-hleda-jmeno': 'kavarna-co-hleda-jmeno',
  'kino-pilotu': 'kino-pilotu',
  'klubovna-2-patro': '2-patro-take-klubovna-2-patro',
  'ku-club-bar': 'ku-club-bar',
  'moonclub': 'moon-club-lounge',
  'nod': 'divadlo-nod-cafe-nod',
  'ox-prague-club': 'ox-club-prague',
  'pytloun-old-armoury-hotel-prague': 'pytloun-old-armoury-hotel-prague',
  'pytloun-sky-bar-restaurant-prague': 'pytloun-sky-bar-restaurant',
  'radlicka-kulturni-sportovna': 'radlicka-kulturni-sportovna',
  'strecha-radost': 'strecha-radost',
  'the-monkey-bar-prague': 'monkey-bar-prague',
}

const EXTENSION_CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

async function ensureBucketExists(bucketName) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    throw new Error(`Unable to list storage buckets: ${listError.message}`)
  }

  const exists = buckets?.some((bucket) => bucket.name === bucketName)
  if (exists) {
    return
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: Object.values(EXTENSION_CONTENT_TYPES),
  })

  if (createError) {
    throw new Error(`Failed to create bucket "${bucketName}": ${createError.message}`)
  }

  console.log(`🪣 Created storage bucket "${bucketName}".`)
}

function getContentType(fileName) {
  const ext = path.extname(fileName).replace('.', '').toLowerCase()
  return EXTENSION_CONTENT_TYPES[ext] || 'application/octet-stream'
}

async function getFolders() {
  const entries = await fs.readdir(IMAGE_ROOT, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

async function uploadFolderImages(folderName, slug) {
  const folderPath = path.join(IMAGE_ROOT, folderName)
  const venue = await prisma.venue.findUnique({ where: { slug } })

  if (!venue) {
    console.warn(`⚠️  Venue with slug "${slug}" not found. Skipping folder "${folderName}".`)
    return { slug, skipped: true }
  }

  const fileEntries = await fs.readdir(folderPath, { withFileTypes: true })
  const files = fileEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  if (files.length === 0) {
    console.warn(`⚠️  No image files found in folder "${folderName}".`)
    return { slug, skipped: true }
  }

  const uploadedUrls = []

  for (const fileName of files) {
    const filePath = path.join(folderPath, fileName)
    const fileBuffer = await fs.readFile(filePath)
    const contentType = getContentType(fileName)
    const storagePath = `venue-images/${slug}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('venues')
      .upload(storagePath, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload ${fileName} for ${slug}: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('venues').getPublicUrl(storagePath)

    uploadedUrls.push(publicUrl)
  }

  await prisma.venue.update({
    where: { slug },
    data: { images: uploadedUrls },
  })

  console.log(`✅ Updated venue ${slug} with ${uploadedUrls.length} images.`)
  return { slug, count: uploadedUrls.length }
}

async function main() {
  console.log('📸 Uploading venue images to Supabase storage...')
  console.log(`Using database: ${DATABASE_URL.replace(/:[^:@/]*@/, '://***:***@')}`)

  await ensureBucketExists('venues')

  const folders = await getFolders()
  const results = []

  for (const folderName of folders) {
    const slug = folderToSlugMap[folderName]
    if (!slug) {
      console.warn(`⚠️  No slug mapping found for folder "${folderName}". Skipping.`)
      continue
    }

    try {
      const result = await uploadFolderImages(folderName, slug)
      results.push(result)
    } catch (error) {
      console.error(`❌ Error processing folder "${folderName}":`, error)
    }
  }

  const uploaded = results.filter((result) => !result?.skipped)
  console.log(`\n🎉 Completed. Updated ${uploaded.length} venues with new images.`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  prisma.$disconnect().finally(() => process.exit(1))
})
