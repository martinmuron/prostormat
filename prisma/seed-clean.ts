import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@prostormat.cz' },
    update: {},
    create: {
      email: 'admin@prostormat.cz',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  })

  // Create the real venues manager (already exists)
  const managerPassword = await bcrypt.hash('manager123', 12)
  const realVenuesManager = await prisma.user.upsert({
    where: { email: 'newvenues@prostormat.cz' },
    update: {},
    create: {
      email: 'newvenues@prostormat.cz',
      name: 'Real Venues Manager',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 800 900 100',
      company: 'Prostormat'
    },
  })

  // Create a sample user for testing
  const userPassword = await bcrypt.hash('user123', 12)
  const sampleUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Jan Novák',
      password: userPassword,
      role: 'user',
      company: 'ABC s.r.o.',
      phone: '+420 123 456 789',
    },
  })

  // Create test user
  const testPassword = await bcrypt.hash('12345', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test User',
      password: testPassword,
      role: 'user',
      company: 'Test Company',
      phone: '+420 775 654 639',
    },
  })

  // Create sample event requests
  await prisma.eventRequest.create({
    data: {
      userId: sampleUser.id,
      title: 'Firemní vánoční večírek',
      description: 'Hledáme prostor pro vánoční večírek naší společnosti. Očekáváme cca 80 hostů, potřebujeme prostor s možností tance a catering.',
      eventType: 'firemni-akce',
      eventDate: new Date('2025-12-15'),
      guestCount: 80,
      budgetRange: '100 000 - 200 000 Kč',
      locationPreference: 'Praha 1',
      requirements: 'Parkovací místa, možnost tance, catering',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@abc.cz',
      contactPhone: '+420 123 456 789',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  await prisma.eventRequest.create({
    data: {
      userId: sampleUser.id,
      title: 'Teambuilding pro 25 lidí',
      description: 'Potřebujeme prostor pro celodenní teambuilding s workshopy a prezentacemi.',
      eventType: 'teambuilding',
      eventDate: new Date('2025-11-20'),
      guestCount: 25,
      budgetRange: '50 000 - 100 000 Kč',
      locationPreference: 'Praha 2',
      requirements: 'Projektor, flipchart, občerstvení',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@abc.cz',
      contactPhone: '+420 123 456 789',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  console.log('Database seeded successfully!')
  console.log('Users created:')
  console.log('- Admin: admin@prostormat.cz / admin123')
  console.log('- Real Venues Manager: newvenues@prostormat.cz / manager123')
  console.log('- User: user@example.com / user123')
  console.log('- Test User: test@test.com / 12345')
  console.log('')
  console.log('Sample event requests created')
  console.log('')
  console.log('NOTE: All venues are real venues from your documents.')
  console.log('No placeholder venues are created by this seed script.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })