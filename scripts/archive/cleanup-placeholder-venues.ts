import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of placeholder venue slugs to delete
const placeholderSlugs = [
  'restaurant-terasa',
  'galerie-moderna', 
  'skybar-prague',
  'conference-center-prague',
  'garden-villa-petrin',
  'industrial-loft-karlin',
  'penthouse-wenceslas' // This might be from production
]

async function main() {
  console.log('Starting cleanup of placeholder venues...')
  
  let deleted = 0
  let notFound = 0
  
  for (const slug of placeholderSlugs) {
    try {
      const venue = await prisma.prostormat_venues.findUnique({
        where: { slug }
      })
      
      if (venue) {
        await prisma.prostormat_venues.delete({
          where: { slug }
        })
        console.log(`🗑️  Deleted placeholder venue: ${venue.name}`)
        deleted++
      } else {
        console.log(`⚠️  Placeholder venue not found: ${slug}`)
        notFound++
      }
    } catch (error) {
      console.error(`Error deleting ${slug}:`, error)
    }
  }
  
  console.log(`\n🧹 Cleanup completed!`)
  console.log(`   Deleted: ${deleted} placeholder venues`)
  console.log(`   Not found: ${notFound} venues`)
}

main()
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })