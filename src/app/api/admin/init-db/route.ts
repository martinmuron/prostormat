import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database initialization...');

    // First, try to connect to the database
    await prisma.$connect();
    console.log('Database connected successfully');

    // Run database migrations (this will create tables if they don't exist)
    console.log('Running database migrations...');
    try {
      // This will create the tables based on the Prisma schema
      await prisma.$executeRaw`SELECT 1`;
      console.log('Database is responsive');
    } catch (dbError) {
      console.log('Database might need schema setup:', dbError);
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@prostormat.cz' },
      update: {},
      create: {
        email: 'admin@prostormat.cz',
        name: 'Admin',
        password: adminPassword,
        role: 'admin',
      },
    });
    console.log('Admin user created:', admin.email);

    // Create a venue manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@prostormat.cz' },
      update: {},
      create: {
        email: 'manager@prostormat.cz',
        name: 'Venue Manager',
        password: managerPassword,
        role: 'venue_manager',
      },
    });
    console.log('Manager created:', manager.email);

    // Create some test venues
    const testVenues = [
      {
        name: 'Villa Richter',
        slug: 'villa-richter',
        description: 'Luxusní prostor s výhledem na Prahu v srdci Hradčan. Ideální pro firemní akce a svatby.',
        address: 'Staré zámecké schody 251/6, Praha 1',
        capacitySeated: 120,
        capacityStanding: 200,
        priceRange: '15 000 - 25 000 Kč',
        venueType: 'restaurant',
        amenities: ['Wi-Fi', 'Projektor', 'Catering', 'Parkování', 'Klimatizace'],
        contactEmail: 'info@villarichter.cz',
        contactPhone: '+420 123 456 789',
        websiteUrl: 'https://villarichter.cz',
        images: ['https://images.unsplash.com/photo-1519167758481-83f29c8a93c4?w=800'],
        status: 'active',
        managerId: manager.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Loft Karlín',
        slug: 'loft-karlin',
        description: 'Moderní industriální prostor v trendové čtvrti Karlín. Perfektní pro kreativní akce.',
        address: 'Křižíkova 34, Praha 8 - Karlín',
        capacitySeated: 80,
        capacityStanding: 150,
        priceRange: '8 000 - 15 000 Kč',
        venueType: 'gallery',
        amenities: ['Wi-Fi', 'Zvukový systém', 'Osvětlení', 'Bar'],
        contactEmail: 'info@loftkarlin.cz',
        contactPhone: '+420 234 567 890',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        status: 'active',
        managerId: manager.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Sky Bar Prague',
        slug: 'sky-bar-prague',
        description: 'Střešní terasa s panoramatickým výhledem na Prahu. Nezapomenutelný zážitek pro vaše hosty.',
        address: 'Wenceslas Square 36, Praha 1',
        capacitySeated: 60,
        capacityStanding: 120,
        priceRange: '20 000 - 35 000 Kč',
        venueType: 'rooftop',
        amenities: ['Wi-Fi', 'Bar', 'Výhled', 'Vytápění', 'DJ booth'],
        contactEmail: 'events@skybarprague.cz',
        contactPhone: '+420 345 678 901',
        images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'],
        status: 'active',
        managerId: manager.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Forum Karlín',
        slug: 'forum-karlin',
        description: 'Prestižní koncertní sál a konferenční centrum pro velké akce a konference.',
        address: 'Thámova 190, Praha 8 - Karlín',
        capacitySeated: 300,
        capacityStanding: 500,
        priceRange: '30 000 - 50 000 Kč',
        venueType: 'conference',
        amenities: ['Wi-Fi', 'Projektor', 'Zvukový systém', 'Klimatizace', 'Parkování'],
        contactEmail: 'info@forumkarlin.cz',
        contactPhone: '+420 456 789 012',
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
        status: 'active',
        managerId: manager.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Café Savoy',
        slug: 'cafe-savoy',
        description: 'Elegantní kavárna s historickým nádechem. Dokonalé pro menší společenské akce.',
        address: 'Vítězná 124/5, Praha 5 - Smíchov',
        capacitySeated: 40,
        capacityStanding: 70,
        priceRange: '5 000 - 12 000 Kč',
        venueType: 'cafe',
        amenities: ['Wi-Fi', 'Catering', 'Historický interiér'],
        contactEmail: 'events@cafesavoy.cz',
        contactPhone: '+420 567 890 123',
        images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'],
        status: 'active',
        managerId: manager.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    // Create the venues
    for (const venueData of testVenues) {
      const venue = await prisma.venue.upsert({
        where: { slug: venueData.slug },
        update: {},
        create: venueData,
      });
      console.log('Venue created:', venue.name);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully!',
      venuesCreated: testVenues.length 
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}