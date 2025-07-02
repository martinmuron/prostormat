import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a sample admin user
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

  // Create venue managers
  const managerPassword = await bcrypt.hash('manager123', 12)
  
  const manager1 = await prisma.user.upsert({
    where: { email: 'terasa@example.com' },
    update: {},
    create: {
      email: 'terasa@example.com',
      name: 'Restaurant Terasa Manager',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 222 333 444',
    },
  })

  const manager2 = await prisma.user.upsert({
    where: { email: 'galerie@example.com' },
    update: {},
    create: {
      email: 'galerie@example.com',
      name: 'Galerie Moderna Manager',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 111 222 333',
    },
  })

  const manager3 = await prisma.user.upsert({
    where: { email: 'skybar@example.com' },
    update: {},
    create: {
      email: 'skybar@example.com',
      name: 'SkyBar Prague Manager',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 777 888 999',
    },
  })

  // Create sample venues
  const venue1 = await prisma.venue.upsert({
    where: { slug: 'restaurant-terasa' },
    update: {},
    create: {
      name: 'Restaurant Terasa',
      slug: 'restaurant-terasa',
      description: 'Elegantní restaurace s výhledem na Pražský hrad, ideální pro firemní akce a slavnostní večery. Nabízíme exkluzivní prostředí s terasou a profesionální servis.',
      address: 'Kampa Island 1, Praha 1',
      capacitySeated: 80,
      capacityStanding: 120,
      priceRange: '2000-4000 Kč/osoba',
      venueType: 'restaurant',
      amenities: ['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Terasa', 'Parking'],
      contactEmail: 'info@restaurant-terasa.cz',
      contactPhone: '+420 222 333 444',
      images: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  })

  const venue2 = await prisma.venue.upsert({
    where: { slug: 'galerie-moderna' },
    update: {},
    create: {
      name: 'Galerie Moderna',
      slug: 'galerie-moderna',
      description: 'Moderní galerie v centru Prahy s flexibilními prostory pro konference, výstavy a networking events. Vysoké stropy a minimalistický design.',
      address: 'Národní 20, Praha 1',
      capacitySeated: 150,
      capacityStanding: 250,
      priceRange: '30000-50000 Kč/den',
      venueType: 'gallery',
      amenities: ['Multimediální vybavení', 'Catering možnosti', 'Výstavní systém', 'Bezpečnostní systém', 'Klimatizace'],
      contactEmail: 'rezervace@galerie-moderna.cz',
      contactPhone: '+420 111 222 333',
      images: [
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      managerId: manager2.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const venue3 = await prisma.venue.upsert({
    where: { slug: 'skybar-prague' },
    update: {},
    create: {
      name: 'SkyBar Prague',
      slug: 'skybar-prague',
      description: 'Exkluzivní střešní terasa s panoramatickým výhledem na Prahu. Perfektní pro cocktail party a letní akce s nezapomenutelnou atmosférou.',
      address: 'Wenceslas Square 14, Praha 1',
      capacitySeated: 60,
      capacityStanding: 100,
      priceRange: '1500-3000 Kč/osoba',
      venueType: 'rooftop',
      amenities: ['Bar', 'DJ booth', 'Vytápění', 'Zastřešená část', 'VIP sekce', 'Výhled na město'],
      contactEmail: 'events@skybar-prague.com',
      contactPhone: '+420 777 888 999',
      images: [
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      managerId: manager3.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  // Create a sample user
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

  // Create sample event requests
  await prisma.eventRequest.create({
    data: {
      userId: sampleUser.id,
      title: 'Firemní vánoční večírek',
      description: 'Hledáme prostor pro vánoční večírek naší společnosti. Očekáváme cca 80 hostů, potřebujeme prostor s možností tance a catering.',
      eventType: 'firemni-akce',
      eventDate: new Date('2024-12-15'),
      guestCount: 80,
      budgetRange: '100 000 - 200 000 Kč',
      locationPreference: 'Praha 1',
      requirements: 'Parkovací místa, možnost tance, catering',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@abc.cz',
      contactPhone: '+420 123 456 789',
      status: 'active',
    },
  })

  await prisma.eventRequest.create({
    data: {
      userId: sampleUser.id,
      title: 'Teambuilding pro 25 lidí',
      description: 'Potřebujeme prostor pro celodenní teambuilding s workshopy a prezentacemi.',
      eventType: 'teambuilding',
      eventDate: new Date('2024-11-20'),
      guestCount: 25,
      budgetRange: '50 000 - 100 000 Kč',
      locationPreference: 'Praha 2',
      requirements: 'Projektor, flipchart, občerstvení',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@abc.cz',
      contactPhone: '+420 123 456 789',
      status: 'active',
    },
  })

  console.log('Database seeded successfully!')
  console.log('Sample users created:')
  console.log('- Admin: admin@prostormat.cz / admin123')
  console.log('- Manager 1: terasa@example.com / manager123')
  console.log('- Manager 2: galerie@example.com / manager123')
  console.log('- Manager 3: skybar@example.com / manager123')
  console.log('- User: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })