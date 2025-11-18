import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface VenueFix {
  searchName: string
  expectedSlug: string
  imageDir: string
  newAddress?: string
}

const VENUE_FIXES: VenueFix[] = [
  {
    searchName: 'THE POP UP',
    expectedSlug: 'the-pop-up',
    imageDir: 'pop up bar',
    newAddress: 'Na Příkopě 3'
  },
  {
    searchName: 'Enforum Event Space',
    expectedSlug: 'enforum-event-space',
    imageDir: 'forum-karlin',
    newAddress: undefined // Keep existing
  }
]

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
    const extension = path.extname(file)
    const newFileName = `image_${correctSlug.replace(/\./g, '_').replace(/\s+/g, '_')}_${index + 1}${extension}`
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
    console.log(`  ⚠️  Target directory already exists, using current: ${currentName}`)
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

async function updateVenue(venueId: string, venueName: string, imagePaths: string[], newAddress?: string) {
  try {
    const updateData: any = { images: imagePaths }
    if (newAddress) {
      updateData.address = newAddress
    }

    await prisma.venue.update({
      where: { id: venueId },
      data: updateData
    })

    console.log(`  ✅ Updated venue "${venueName}" in database`)
    if (newAddress) {
      console.log(`  ✅ Updated address to: ${newAddress}`)
    }
  } catch (error) {
    console.error(`  ❌ Error updating venue:`, error)
  }
}

async function main() {
  console.log('🚀 Starting venue fixes...\n')
  console.log('=' .repeat(60))

  for (const fix of VENUE_FIXES) {
    console.log(`\n\n🔍 Processing: ${fix.searchName}`)

    // Find the venue in database
    const venue = await prisma.venue.findFirst({
      where: {
        OR: [
          { slug: { equals: fix.expectedSlug } },
          { name: { contains: fix.searchName, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, slug: true, address: true, images: true }
    })

    if (!venue) {
      console.log(`  ⚠️  Venue not found in database: ${fix.searchName}`)
      continue
    }

    console.log(`  ✅ Found venue: "${venue.name}" (slug: ${venue.slug})`)
    console.log(`  📍 Current address: ${venue.address}`)

    // Fix directory name if needed
    const basePath = path.join(process.cwd(), 'prostory', 'prostory_images')
    const currentDirPath = path.join(basePath, fix.imageDir)

    const finalDirName = await fixDirectoryName(fix.imageDir, venue.slug)
    const finalDirPath = path.join(basePath, finalDirName)

    // Rename images inside the directory
    const imagePaths = await renameImagesInDirectory(finalDirPath, venue.slug)

    // Update database with new image paths and address
    if (imagePaths.length > 0 || fix.newAddress) {
      await updateVenue(venue.id, venue.name, imagePaths.length > 0 ? imagePaths : venue.images, fix.newAddress)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ All venue fixes completed!')
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
