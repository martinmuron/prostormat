import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface VenueImageFix {
  currentDir: string
  expectedSlug: string
  venueName?: string
}

const IMAGE_FIXES: VenueImageFix[] = [
  {
    currentDir: 'Le Valmont Club & Lounge',
    expectedSlug: 'le-valmont-club-lounge', // Will search for actual venue
    venueName: 'Le Valmont'
  },
  {
    currentDir: 'forum-karlin',
    expectedSlug: 'forum-karlin',
    venueName: 'Forum Karlín'
  },
  {
    currentDir: 'jezero.ooo',
    expectedSlug: 'jezero.ooo',
    venueName: 'JEZERO.OOO'
  },
  {
    currentDir: 'narodni-dum-na-vinohradech',
    expectedSlug: 'narodni-dum-na-vinohradech',
    venueName: 'Národní dům na Vinohradech'
  }
]

async function findVenueByNameOrSlug(searchTerm: string) {
  const venue = await prisma.venue.findFirst({
    where: {
      OR: [
        { slug: { equals: searchTerm } },
        { slug: { contains: searchTerm.replace(/\s+/g, '-').toLowerCase() } },
        { name: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, slug: true, images: true }
  })
  return venue
}

async function renameImagesInDirectory(dirPath: string, correctSlug: string) {
  console.log(`\n📁 Processing directory: ${dirPath}`)

  if (!fs.existsSync(dirPath)) {
    console.log(`  ❌ Directory not found: ${dirPath}`)
    return []
  }

  const files = fs.readdirSync(dirPath)
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))

  console.log(`  Found ${imageFiles.length} image files`)

  const renamedPaths: string[] = []

  // Sort files to maintain order
  imageFiles.sort()

  imageFiles.forEach((file, index) => {
    const oldPath = path.join(dirPath, file)
    const newFileName = `image_${correctSlug.replace(/\./g, '_')}_${index + 1}.jpg`
    const newPath = path.join(dirPath, newFileName)

    if (oldPath !== newPath) {
      try {
        fs.renameSync(oldPath, newPath)
        console.log(`  ✅ Renamed: ${file} -> ${newFileName}`)
        renamedPaths.push(`/prostory_images/${path.basename(dirPath)}/${newFileName}`)
      } catch (error) {
        console.error(`  ❌ Error renaming ${file}:`, error)
      }
    } else {
      console.log(`  ℹ️  Already correctly named: ${file}`)
      renamedPaths.push(`/prostory_images/${path.basename(dirPath)}/${newFileName}`)
    }
  })

  return renamedPaths
}

async function fixDirectoryName(currentName: string, correctSlug: string) {
  const basePath = path.join(process.cwd(), 'prostory', 'prostory_images')
  const currentPath = path.join(basePath, currentName)
  const newPath = path.join(basePath, correctSlug)

  if (currentPath === newPath) {
    console.log(`  ℹ️  Directory name already correct: ${correctSlug}`)
    return correctSlug
  }

  if (!fs.existsSync(currentPath)) {
    console.log(`  ❌ Current directory not found: ${currentPath}`)
    return currentName
  }

  if (fs.existsSync(newPath)) {
    console.log(`  ⚠️  Target directory already exists: ${newPath}`)
    return currentName
  }

  try {
    fs.renameSync(currentPath, newPath)
    console.log(`  ✅ Renamed directory: ${currentName} -> ${correctSlug}`)
    return correctSlug
  } catch (error) {
    console.error(`  ❌ Error renaming directory:`, error)
    return currentName
  }
}

async function updateVenueImages(venueId: string, venueName: string, imagePaths: string[]) {
  try {
    await prisma.venue.update({
      where: { id: venueId },
      data: { images: imagePaths }
    })
    console.log(`  ✅ Updated image paths in database for "${venueName}"`)
  } catch (error) {
    console.error(`  ❌ Error updating venue images:`, error)
  }
}

async function main() {
  console.log('🚀 Starting venue image fixes...\n')
  console.log('=' .repeat(60))

  for (const fix of IMAGE_FIXES) {
    console.log(`\n\n🔍 Processing: ${fix.venueName || fix.currentDir}`)

    // Find the venue in database
    const venue = await findVenueByNameOrSlug(fix.venueName || fix.expectedSlug)

    if (!venue) {
      console.log(`  ⚠️  Venue not found in database: ${fix.venueName}`)
      console.log(`  🔍 Searched for: ${fix.venueName} or ${fix.expectedSlug}`)
      continue
    }

    console.log(`  ✅ Found venue: "${venue.name}" (slug: ${venue.slug})`)

    // Fix directory name if needed
    const basePath = path.join(process.cwd(), 'prostory', 'prostory_images')
    const currentDirPath = path.join(basePath, fix.currentDir)

    const finalDirName = await fixDirectoryName(fix.currentDir, venue.slug)
    const finalDirPath = path.join(basePath, finalDirName)

    // Rename images inside the directory
    const imagePaths = await renameImagesInDirectory(finalDirPath, venue.slug)

    // Update database with new image paths
    if (imagePaths.length > 0) {
      await updateVenueImages(venue.id, venue.name, imagePaths)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ All image fixes completed!')
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
