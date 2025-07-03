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

    // Check if test venue already exists
    const existingVenue = await prisma.venue.findUnique({
      where: { slug: 'test-event-space' }
    })

    if (!existingVenue) {
      // Create test venue for location manager
      await prisma.venue.create({
        data: {
          name: 'Test Event Space',
          slug: 'test-event-space',
          description: 'Beautiful test venue for all your event needs. Modern facilities with stunning views and professional amenities.',
          address: 'Václavské náměstí 1, 110 00 Praha 1, Česká republika',
          capacitySeated: 120,
          capacityStanding: 200,
          venueType: 'conference-hall',
          amenities: ['wifi', 'parking', 'catering', 'av-equipment', 'air-conditioning'],
          contactEmail: 'location@location.com',
          contactPhone: '+420 775 654 640',
          websiteUrl: 'https://test-venue.com',
          images: [],
          status: 'active',
          managerId: locationManager.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }
      })
    }

    console.log('✅ Production database seeded with essential users and venues')
    console.log('   - Test user: test@test.com / 123456')
    console.log('   - Admin user: admin@prostormat.cz / admin123')
    console.log('   - Location manager: location@location.com / 123456')
    console.log('   - Test venue: Test Event Space')

  } catch (error) {
    console.error('Error during safe seeding:', error)
    // Don't throw error to prevent deployment failure
  } finally {
    await prisma.$disconnect()
  }
}

main()