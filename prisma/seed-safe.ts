import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Only run in production environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('Skipping safe seed - not in production environment')
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
    const testPassword = await bcrypt.hash('12345', 12)
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

    console.log('✅ Production database seeded with essential users')
    console.log('   - Test user: test@test.com / 12345')
    console.log('   - Admin user: admin@prostormat.cz / admin123')

  } catch (error) {
    console.error('Error during safe seeding:', error)
    // Don't throw error to prevent deployment failure
  } finally {
    await prisma.$disconnect()
  }
}

main()