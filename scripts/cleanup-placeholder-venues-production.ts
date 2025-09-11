import { PrismaClient } from '@prisma/client'

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL
    }
  }
})

// List of placeholder venue slugs to delete (including production ones)
const placeholderSlugs = [
  'restaurant-terasa',
  'galerie-moderna', 
  'skybar-prague',
  'conference-center-prague',
  'garden-villa-petrin',
  'industrial-loft-karlin',
  'penthouse-wenceslas', // This is in production
  'skybar-venue', // Additional production placeholders
  'modern-conference-center',
  'riverside-restaurant',
  'urban-gallery-space'
]

async function main() {
  console.log('Starting cleanup of placeholder venues in PRODUCTION...')
  console.log('Database URL:', process.env.DATABASE_URL_PRODUCTION ? 'Production (Supabase)' : 'Local Development')
  
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
  
  console.log(`\n🧹 Production cleanup completed!`)
  console.log(`   Deleted: ${deleted} placeholder venues`)
  console.log(`   Not found: ${notFound} venues`)
}

main()
  .catch((error) => {
    console.error('Production cleanup failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })