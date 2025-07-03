import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting safe seed process...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Run in production environment or Railway deployment
    if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
      console.log('Skipping safe seed - not in production or Railway environment')
      return
    }

    // Check if database already has users (indicating it's been seeded)
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      console.log('Database already has users, skipping seed')
      return
    }

    console.log('First-time production deployment detected, seeding essential data...')

    // Create test user
    const testPassword = await bcrypt.hash('123456', 12)
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: testPassword,
        role: 'user',
        company: 'Test Company',
        phone: '+420 775 654 639',
      },
    })

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: {
        email: 'admin@prostormat.cz',
        name: 'Admin',
        password: adminPassword,
        role: 'admin',
      },
    })

    // Check if location manager already exists
    let locationManager = await prisma.user.findUnique({
      where: { email: 'location@location.com' }
    })

    if (!locationManager) {
      // Create location manager user
      const locationPassword = await bcrypt.hash('123456', 12)
      locationManager = await prisma.user.create({
        data: {
          email: 'location@location.com',
          name: 'Location Manager',
          password: locationPassword,
          role: 'venue_manager',
          company: 'Location Management',
          phone: '+420 775 654 640',
        },
      })
    }

    // Assign existing SkyBar Prague venue to location manager
    await prisma.venue.updateMany({
      where: { slug: 'skybar-prague' },
      data: {
        managerId: locationManager.id,
        contactEmail: 'location@location.com',
        contactPhone: '+420 775 654 640',
        status: 'active'
      }
    })

    // Also assign Penthouse Wenceslas to give them multiple venues
    await prisma.venue.updateMany({
      where: { slug: 'penthouse-wenceslas' },
      data: {
        managerId: locationManager.id,
        contactEmail: 'location@location.com',
        contactPhone: '+420 775 654 640',
        status: 'active'
      }
    })

    console.log('✅ Production database seeded with essential users and venues')
    console.log('   - Test user: test@test.com / 123456')
    console.log('   - Admin user: admin@prostormat.cz / admin123')
    console.log('   - Location manager: location@location.com / 123456')
    console.log('   - Assigned venues: SkyBar Prague, Penthouse Wenceslas')

  } catch (error) {
    console.error('Error during safe seeding:', error)
    // Don't throw error to prevent deployment failure
  } finally {
    await prisma.$disconnect()
  }
}

main()