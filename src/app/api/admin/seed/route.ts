import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Simple password check for security
    const body = await request.json()
    const { password } = body
    
    if (password !== "prostormat-seed-2025") {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Check if database already has data
    const existingVenues = await prisma.venue.count()
    if (existingVenues > 0) {
      return NextResponse.json({
        message: "Database already seeded",
        existingVenues
      })
    }

    console.log('Starting database seeding...')

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
    const venues = [
      {
        name: 'Restaurant Terasa',
        slug: 'restaurant-terasa',
        description: 'Elegantní restaurace s výhledem na Pražský hrad, ideální pro firemní akce a slavnostní večery.',
        address: 'Kampa Island 1, Praha 1',
        capacitySeated: 80,
        capacityStanding: 120,
        venueType: 'restaurant',
        amenities: ['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Terasa', 'Parking'],
        contactEmail: 'info@restaurant-terasa.cz',
        contactPhone: '+420 222 333 444',
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Galerie Moderna',
        slug: 'galerie-moderna',
        description: 'Moderní galerie v centru Prahy s flexibilními prostory pro konference a výstavy.',
        address: 'Národní 20, Praha 1',
        capacitySeated: 150,
        capacityStanding: 250,
        venueType: 'gallery',
        amenities: ['Multimediální vybavení', 'Catering možnosti', 'Výstavní systém', 'Klimatizace'],
        contactEmail: 'rezervace@galerie-moderna.cz',
        contactPhone: '+420 111 222 333',
        images: [
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'SkyBar Prague',
        slug: 'skybar-prague',
        description: 'Exkluzivní střešní terasa s panoramatickým výhledem na Prahu.',
        address: 'Wenceslas Square 14, Praha 1',
        capacitySeated: 60,
        capacityStanding: 100,
        venueType: 'rooftop',
        amenities: ['Bar', 'DJ booth', 'Vytápění', 'Výhled na město'],
        contactEmail: 'events@skybar-prague.com',
        contactPhone: '+420 777 888 999',
        images: [
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      },
      {
        name: 'Forum Karlín',
        slug: 'forum-karlin-venue',
        description: 'Prestižní koncertní sál a konferenční centrum pro velké akce.',
        address: 'Thámova 190, Praha 8',
        capacitySeated: 500,
        capacityStanding: 800,
        venueType: 'conference',
        amenities: ['Profesionální zvuk', 'Osvětlení', 'Projekce', 'VIP prostory', 'Parkování'],
        contactEmail: 'events@forumkarlin.cz',
        contactPhone: '+420 225 315 555',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Loft 39',
        slug: 'loft-39',
        description: 'Industriální loft s vysokými stropy pro kreativní akce.',
        address: 'Holečkova 39, Praha 5',
        capacitySeated: 70,
        capacityStanding: 110,
        venueType: 'loft',
        amenities: ['Vysoké stropy', 'Industriální design', 'WiFi', 'Bar'],
        contactEmail: 'info@loft39.cz',
        contactPhone: '+420 602 123 789',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'Villa Lanna',
        slug: 'villa-lanna',
        description: 'Historická vila s krásnou zahradou na Kampě.',
        address: 'Kampa Island 2, Praha 1',
        capacitySeated: 100,
        capacityStanding: 150,
        venueType: 'villa',
        amenities: ['Zahrada', 'Historický interiér', 'Parkování', 'WiFi'],
        contactEmail: 'events@villalanna.cz',
        contactPhone: '+420 224 312 456',
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      }
    ]

    // Create venues
    const createdVenues = []
    for (const venueData of venues) {
      const venue = await prisma.venue.create({
        data: {
          ...venueData,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }
      })
      createdVenues.push(venue)
      console.log('Created venue:', venue.name)
    }

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
        description: 'Hledáme prostor pro vánoční večírek naší společnosti. Očekáváme cca 80 hostů.',
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.eventRequest.create({
      data: {
        userId: sampleUser.id,
        title: 'Teambuilding pro 25 lidí',
        description: 'Potřebujeme prostor pro celodenní teambuilding s workshopy.',
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('Database seeded successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      venuesCreated: createdVenues.length,
      venues: createdVenues.map(v => ({ id: v.id, name: v.name, slug: v.slug }))
    })

  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}