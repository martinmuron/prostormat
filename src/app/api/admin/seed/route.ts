import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Simple password check via header for security
    const adminPassword = request.headers.get("x-admin-password")
    
    if (adminPassword !== "112233") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if venues already exist to avoid duplicates
    const existingVenues = await prisma.venue.count()
    if (existingVenues > 0) {
      return NextResponse.json({
        message: "Database already has venues",
        venueCount: existingVenues
      })
    }

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

    // Create featured venues with ACTIVE status
    const venues = await Promise.all([
      prisma.venue.create({
        data: {
          name: 'Restaurant Terasa',
          slug: 'restaurant-terasa',
          description: 'Elegantní restaurace s výhledem na Pražský hrad, ideální pro firemní akce a slavnostní večery. Nabízíme exkluzivní prostředí s terasou a profesionální servis.',
          address: 'Kampa Island 1, Praha 1',
          capacitySeated: 80,
          capacityStanding: 120,
          venueType: 'restaurant',
          amenities: JSON.stringify(['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Terasa', 'Parking']),
          contactEmail: 'info@restaurant-terasa.cz',
          contactPhone: '+420 222 333 444',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager1.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      
      prisma.venue.create({
        data: {
          name: 'Galerie Moderna',
          slug: 'galerie-moderna',
          description: 'Moderní galerie v centru Prahy s flexibilními prostory pro konference, výstavy a networking events. Vysoké stropy a minimalistický design.',
          address: 'Národní 20, Praha 1',
          capacitySeated: 150,
          capacityStanding: 250,
          venueType: 'gallery',
          amenities: JSON.stringify(['Multimediální vybavení', 'Catering možnosti', 'Výstavní systém', 'Bezpečnostní systém', 'Klimatizace']),
          contactEmail: 'rezervace@galerie-moderna.cz',
          contactPhone: '+420 111 222 333',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager2.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      
      prisma.venue.create({
        data: {
          name: 'SkyBar Prague',
          slug: 'skybar-prague',
          description: 'Exkluzivní střešní terasa s panoramatickým výhledem na Prahu. Perfektní pro cocktail party a letní akce s nezapomenutelnou atmosférou.',
          address: 'Wenceslas Square 14, Praha 1',
          capacitySeated: 60,
          capacityStanding: 100,
          venueType: 'rooftop',
          amenities: JSON.stringify(['Bar', 'DJ booth', 'Vytápění', 'Zastřešená část', 'VIP sekce', 'Výhled na město']),
          contactEmail: 'events@skybar-prague.com',
          contactPhone: '+420 777 888 999',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager3.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      
      prisma.venue.create({
        data: {
          name: 'Villa Lanna',
          slug: 'villa-lanna',
          description: 'Historická vila s krásnou zahradou na Kampě. Exkluzivní prostor pro svatby a reprezentativní akce.',
          address: 'Kampa Island 2, Praha 1',
          capacitySeated: 100,
          capacityStanding: 150,
          venueType: 'villa',
          amenities: JSON.stringify(['Zahrada', 'Historický interiér', 'Parkování', 'Catering možnosti', 'WiFi']),
          contactEmail: 'events@villalanna.cz',
          contactPhone: '+420 224 312 456',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager1.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      
      prisma.venue.create({
        data: {
          name: 'Karlín Studios',
          slug: 'karlin-studios',
          description: 'Kreativní hub v srdci Karlína s flexibilními prostory pro workshopy a networking.',
          address: 'Křižíkova 34, Praha 8',
          capacitySeated: 80,
          capacityStanding: 120,
          venueType: 'studio',
          amenities: JSON.stringify(['Flexibilní prostory', 'Multimediální vybavení', 'WiFi', 'Kuchyňka', 'Terasa']),
          contactEmail: 'hello@karlinstudios.cz',
          contactPhone: '+420 775 123 987',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager2.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      
      prisma.venue.create({
        data: {
          name: 'Industrial Hall Smíchov',
          slug: 'industrial-hall-smichov',
          description: 'Bývalá průmyslová hala přeměněná na moderní event prostor na Smíchově.',
          address: 'Radlická 180, Praha 5',
          capacitySeated: 200,
          capacityStanding: 350,
          venueType: 'hall',
          amenities: JSON.stringify(['Vysoké stropy', 'Flexibilní prostory', 'Parkování', 'Loading bay', 'Multimediální vybavení']),
          contactEmail: 'info@industrialhall.cz',
          contactPhone: '+420 605 234 876',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          status: 'active',
          managerId: manager3.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Production database seeded successfully!",
      venuesCreated: venues.length,
      venues: venues.map(v => ({ id: v.id, name: v.name, status: v.status }))
    })

  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { error: "Failed to seed database", details: error },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 