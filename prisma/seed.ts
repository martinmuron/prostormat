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

  // Create managers for the new test venues
  const ribsManager = await prisma.user.upsert({
    where: { email: 'manager@ribsofprague.cz' },
    update: {},
    create: {
      email: 'manager@ribsofprague.cz',
      name: 'Tomáš Novák',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 604 123 456',
      company: 'Ribs of Prague s.r.o.'
    },
  })

  const malvazeManager = await prisma.user.upsert({
    where: { email: 'events@umalvaze.cz' },
    update: {},
    create: {
      email: 'events@umalvaze.cz',
      name: 'Marie Svobodová',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 777 234 567',
      company: 'U Malvaze Restaurant'
    },
  })

  const medusaManager = await prisma.user.upsert({
    where: { email: 'booking@medusaprague.com' },
    update: {},
    create: {
      email: 'booking@medusaprague.com',
      name: 'Pavel Dvořák',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 606 345 678',
      company: 'Medusa Group'
    },
  })

  const popupManager = await prisma.user.upsert({
    where: { email: 'info@popupbar.cz' },
    update: {},
    create: {
      email: 'info@popupbar.cz',
      name: 'Lucie Kratochvílová',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 608 456 789',
      company: 'Pop Up Concepts'
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
      venueType: 'restaurant',
      amenities: ['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Terasa', 'Parking'],
      contactEmail: 'info@restaurant-terasa.cz',
      contactPhone: '+420 222 333 444',
      images: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      manager: {
        connect: { id: manager1.id }
      },
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
      venueType: 'gallery',
      amenities: ['Multimediální vybavení', 'Catering možnosti', 'Výstavní systém', 'Bezpečnostní systém', 'Klimatizace'],
      contactEmail: 'rezervace@galerie-moderna.cz',
      contactPhone: '+420 111 222 333',
      images: [
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      manager: {
        connect: { id: manager2.id }
      },
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
      manager: {
        connect: { id: manager3.id }
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  // Create the new test venues
  const ribsOfPrague = await prisma.venue.upsert({
    where: { slug: 'ribs-of-prague' },
    update: {},
    create: {
      name: 'Ribs of Prague',
      slug: 'ribs-of-prague',
      description: 'Autentický americký steakhouse v srdci Prahy. Rustic atmosféra s kvalitním jídlem a bohatou nabídkou whiskey. Ideální pro firemní večírky a oslavy.',
      address: 'Jindřišská 5, Praha 1',
      capacitySeated: 120,
      capacityStanding: 180,
      venueType: 'restaurant',
      amenities: ['Bar', 'Projektor', 'Zvukový systém', 'WiFi', 'Klimatizace', 'Soukromé salónky'],
      contactEmail: 'events@ribsofprague.cz',
      contactPhone: '+420 604 123 456',
      websiteUrl: 'https://www.ribsofprague.cz',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      manager: {
        connect: { id: ribsManager.id }
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const uMalvaze = await prisma.venue.upsert({
    where: { slug: 'u-malvaze' },
    update: {},
    create: {
      name: 'U Malvaze',
      slug: 'u-malvaze',
      description: 'Historická restaurace v pražském Novém Městě s tradičními českými pokrmy a výborným pivem. Stylové prostředí pro menší firemní akce a teambuildingy.',
      address: 'Národní 7, Praha 1',
      capacitySeated: 65,
      capacityStanding: 90,
      venueType: 'restaurant',
      amenities: ['Historický interiér', 'Pivní kultura', 'WiFi', 'Soukromá místnost', 'Projektor'],
      contactEmail: 'rezervace@umalvaze.cz',
      contactPhone: '+420 777 234 567',
      websiteUrl: 'https://www.umalvaze.cz',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'draft', // Testing draft status
      manager: {
        connect: { id: malvazeManager.id }
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const medusaPrague = await prisma.venue.upsert({
    where: { slug: 'medusa-prague' },
    update: {},
    create: {
      name: 'Medusa Prague',
      slug: 'medusa-prague',
      description: 'Moderní event prostor v historické budově. Flexibilní layout s možností rozdělení na více sekcí. Perfektní pro konference, prezentace a networking events.',
      address: 'Purkyňova 2121/7, Praha 2',
      capacitySeated: 200,
      capacityStanding: 350,
      venueType: 'conference',
      amenities: ['Multimediální vybavení', 'Simultánní překlad', 'WiFi', 'Catering možnosti', 'Parkování', 'Klimatizace'],
      contactEmail: 'booking@medusaprague.com',
      contactPhone: '+420 606 345 678',
      websiteUrl: 'https://www.medusaprague.com',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      images: [
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'active',
      manager: {
        connect: { id: medusaManager.id }
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const popUpBar = await prisma.venue.upsert({
    where: { slug: 'pop-up-bar' },
    update: {},
    create: {
      name: 'Pop Up Bar',
      slug: 'pop-up-bar',
      description: 'Jedinečný pop-up prostor s proměnlivým designem. Každý měsíc nová koncepce a atmosféra. Ideální pro kreativní akce, product launche a neformální networking.',
      address: 'Vinohrady, Praha 2',
      capacitySeated: 40,
      capacityStanding: 80,
      venueType: 'other',
      amenities: ['Flexibilní design', 'Bar', 'DJ booth', 'Instagram-worthy spot', 'WiFi'],
      contactEmail: 'hello@popupbar.cz',
      contactPhone: '+420 608 456 789',
      images: [
        'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'draft', // Testing another draft status
      manager: {
        connect: { id: popupManager.id }
      },
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

  // Create sample venue inquiries for testing admin functionality
  await prisma.venueInquiry.create({
    data: {
      venueId: ribsOfPrague.id,
      userId: sampleUser.id,
      name: 'Jana Krásná',
      email: 'jana@company.cz',
      phone: '+420 777 123 456',
      eventDate: new Date('2024-12-10'),
      guestCount: 50,
      message: 'Zajímá nás váš prostor pro firemní vánoční večírek. Můžete poslat nabídku?'
    }
  })

  await prisma.venueInquiry.create({
    data: {
      venueId: ribsOfPrague.id,
      name: 'Petr Novotný',
      email: 'petr.novotny@gmail.com',
      phone: '+420 605 987 654',
      eventDate: new Date('2024-11-25'),
      guestCount: 80,
      message: 'Hledáme prostor pro oslavu narozenin. Máte volno na konci listopadu?'
    }
  })

  await prisma.venueInquiry.create({
    data: {
      venueId: medusaPrague.id,
      userId: sampleUser.id,
      name: 'Martin Svoboda',
      email: 'martin@tech-startup.cz',
      phone: '+420 608 555 444',
      eventDate: new Date('2024-12-05'),
      guestCount: 150,
      message: 'Potřebujeme prostor pro product launch. Máte k dispozici projektory a zvuk?'
    }
  })

  await prisma.venueInquiry.create({
    data: {
      venueId: uMalvaze.id,
      name: 'Eva Horáková',
      email: 'eva.horakova@firma.cz',
      phone: '+420 777 333 222',
      eventDate: new Date('2024-11-30'),
      guestCount: 30,
      message: 'Zajímá nás váš prostor pro malý teambuilding. Jaké máte možnosti cateringu?'
    }
  })

  // Create 15 additional test venues to reach total of 20
  const additionalVenues = [
    {
      name: 'Villa Lanna',
      slug: 'villa-lanna',
      description: 'Historická vila s krásnou zahradou na Kampě. Exkluzivní prostor pro svatby a reprezentativní akce.',
      address: 'Kampa Island 2, Praha 1',
      capacitySeated: 100,
      capacityStanding: 150,
      venueType: 'villa',
      amenities: ['Zahrada', 'Historický interiér', 'Parkování', 'Catering možnosti', 'WiFi'],
      contactEmail: 'events@villalanna.cz',
      contactPhone: '+420 224 312 456',
      status: 'active',
      manager: {
        connect: { id: manager1.id }
      },
    },
    {
      name: 'Karlín Studios',
      slug: 'karlin-studios',
      description: 'Kreativní hub v srdci Karlína s flexibilními prostory pro workshopy a networking.',
      address: 'Křižíkova 34, Praha 8',
      capacitySeated: 80,
      capacityStanding: 120,
      venueType: 'studio',
      amenities: ['Flexibilní prostory', 'Multimediální vybavení', 'WiFi', 'Kuchyňka', 'Terasa'],
      contactEmail: 'hello@karlinstudios.cz',
      contactPhone: '+420 775 123 987',
      status: 'active',
      manager: {
        connect: { id: manager2.id }
      },
    },
    {
      name: 'Boat Albatros',
      slug: 'boat-albatros',
      description: 'Plovoucí restaurant na Vltavě s jedinečnou atmosférou pro letní akce.',
      address: 'Podolské nábřeží, Praha 4',
      capacitySeated: 60,
      capacityStanding: 100,
      venueType: 'boat',
      amenities: ['Paluba', 'Bar', 'Výhled na řeku', 'Catering', 'Klimatizace'],
      contactEmail: 'rezervace@albatros.cz',
      contactPhone: '+420 261 007 650',
      status: 'active',
      manager: {
        connect: { id: manager3.id }
      },
    },
    {
      name: 'Forum Karlín',
      slug: 'forum-karlin-venue',
      description: 'Prestižní koncertní sál a konferenční centrum pro velké akce a konference.',
      address: 'Thámova 190, Praha 8',
      capacitySeated: 500,
      capacityStanding: 800,
      venueType: 'conference',
      amenities: ['Profesionální zvuk', 'Osvětlení', 'Projekce', 'VIP prostory', 'Parkování'],
      contactEmail: 'events@forumkarlin.cz',
      contactPhone: '+420 225 315 555',
      status: 'active',
      manager: {
        connect: { id: ribsManager.id }
      },
    },
    {
      name: 'Loft 39',
      slug: 'loft-39',
      description: 'Industriální loft s vysokými stropy a industriálním designem pro kreativní akce.',
      address: 'Holečkova 39, Praha 5',
      capacitySeated: 70,
      capacityStanding: 110,
      venueType: 'loft',
      amenities: ['Vysoké stropy', 'Industriální design', 'WiFi', 'Bar', 'Flexibilní layout'],
      contactEmail: 'info@loft39.cz',
      contactPhone: '+420 602 123 789',
      status: 'active',
      manager: {
        connect: { id: malvazeManager.id }
      },
    },
    {
      name: 'Café Slavia Terrace',
      slug: 'cafe-slavia-terrace',
      description: 'Ikonická kavárna s terasou a výhledem na Národní divadlo. Historická atmosféra.',
      address: 'Národní třída 1, Praha 1',
      capacitySeated: 45,
      capacityStanding: 70,
      venueType: 'cafe',
      amenities: ['Historická atmosféra', 'Terasa', 'Výhled na divadlo', 'WiFi', 'Catering'],
      contactEmail: 'events@cafeslavia.cz',
      contactPhone: '+420 224 218 493',
      status: 'active',
      manager: {
        connect: { id: medusaManager.id }
      },
    },
    {
      name: 'Warehouse 7',
      slug: 'warehouse-7',
      description: 'Prostorný sklad přestavěný na event prostor v Holešovicích. Ideální pro velké akce.',
      address: 'Bubenská 7, Praha 7',
      capacitySeated: 300,
      capacityStanding: 500,
      venueType: 'warehouse',
      amenities: ['Velký prostor', 'Flexibilní layout', 'Loading dock', 'Parkování', 'Zvukový systém'],
      contactEmail: 'booking@warehouse7.cz',
      contactPhone: '+420 777 456 123',
      status: 'active',
      manager: {
        connect: { id: popupManager.id }
      },
    },
    {
      name: 'Rooftop Lucerna',
      slug: 'rooftop-lucerna',
      description: 'Střešní zahrada v pasáži Lucerna s unikátním výhledem na Prahu.',
      address: 'Štěpánská 61, Praha 1',
      capacitySeated: 80,
      capacityStanding: 120,
      venueType: 'rooftop',
      amenities: ['Střešní zahrada', 'Bar', 'Výhled na město', 'Vytápění', 'WiFi'],
      contactEmail: 'events@lucerna.cz',
      contactPhone: '+420 224 216 972',
      status: 'active',
      manager: {
        connect: { id: manager1.id }
      },
    },
    {
      name: 'Industrial Hall Smíchov',
      slug: 'industrial-hall-smichov',
      description: 'Bývalá průmyslová hala přeměněná na moderní event prostor na Smíchově.',
      address: 'Radlická 180, Praha 5',
      capacitySeated: 200,
      capacityStanding: 350,
      venueType: 'hall',
      amenities: ['Vysoké stropy', 'Flexibilní prostory', 'Parkování', 'Loading bay', 'Multimediální vybavení'],
      contactEmail: 'info@industrialhall.cz',
      contactPhone: '+420 605 234 876',
      status: 'active',
      manager: {
        connect: { id: manager2.id }
      },
    },
    {
      name: 'Villa Winternitz',
      slug: 'villa-winternitz',
      description: 'Funkcionalistická vila s architektonickou hodnotou a krásnou zahradou.',
      address: 'Na Ořechovce 28, Praha 6',
      capacitySeated: 60,
      capacityStanding: 90,
      venueType: 'villa',
      amenities: ['Architektonická památka', 'Zahrada', 'WiFi', 'Parkování', 'Klimatizace'],
      contactEmail: 'events@villawinternitz.cz',
      contactPhone: '+420 233 378 681',
      status: 'active',
      manager: {
        connect: { id: manager3.id }
      },
    },
    {
      name: 'Brewery Lounge U Fleku',
      slug: 'brewery-lounge-u-fleku',
      description: 'Historický pivovar s tradičními prostory pro autentické české akce.',
      address: 'Křemencova 11, Praha 1',
      capacitySeated: 120,
      capacityStanding: 180,
      venueType: 'brewery',
      amenities: ['Historické prostory', 'Vlastní pivo', 'Tradiční kuchyně', 'WiFi', 'Živá hudba'],
      contactEmail: 'akce@ufleku.cz',
      contactPhone: '+420 224 934 019',
      status: 'active',
      manager: {
        connect: { id: ribsManager.id }
      },
    },
    {
      name: 'Coworking Space Node5',
      slug: 'coworking-space-node5',
      description: 'Moderní coworking s konferenčními místnostmi pro business networking.',
      address: 'Národní 961/25, Praha 1',
      capacitySeated: 50,
      capacityStanding: 80,
      venueType: 'coworking',
      amenities: ['Moderní vybavení', 'WiFi', 'Videokonference', 'Kuchyňka', 'Parkování'],
      contactEmail: 'events@node5.cz',
      contactPhone: '+420 775 987 456',
      status: 'active',
      manager: {
        connect: { id: malvazeManager.id }
      },
    },
    {
      name: 'Garden Restaurant Hergetova Cihelna',
      slug: 'garden-restaurant-hergetova',
      description: 'Romantická zahradní restaurace s výhledem na Karlův most.',
      address: 'Cihelná 2b, Praha 1',
      capacitySeated: 90,
      capacityStanding: 140,
      venueType: 'garden',
      amenities: ['Zahrada', 'Výhled na most', 'Terasa', 'Fine dining', 'WiFi', 'Valet parking'],
      contactEmail: 'events@hergetova.cz',
      contactPhone: '+420 257 535 534',
      status: 'active',
      manager: {
        connect: { id: medusaManager.id }
      },
    },
    {
      name: 'Art Gallery Mánes',
      slug: 'art-gallery-manes',
      description: 'Prestižní umělecká galerie s výstavními prostory pro kulturní akce.',
      address: 'Masarykovo nábřeží 250, Praha 1',
      capacitySeated: 100,
      capacityStanding: 150,
      venueType: 'gallery',
      amenities: ['Výstavní prostory', 'Profesionální osvětlení', 'WiFi', 'Catering možnosti', 'Výhled na řeku'],
      contactEmail: 'pronajmy@manes.cz',
      contactPhone: '+420 224 932 832',
      status: 'active',
      manager: {
        connect: { id: popupManager.id }
      },
    },
    {
      name: 'Penthouse Wenceslas',
      slug: 'penthouse-wenceslas',
      description: 'Luxusní penthouse na Václavském náměstí s panoramatickým výhledem.',
      address: 'Václavské náměstí 36, Praha 1',
      capacitySeated: 40,
      capacityStanding: 65,
      venueType: 'penthouse',
      amenities: ['Panoramatický výhled', 'Luxusní interiér', 'Terasa', 'Bar', 'WiFi', 'Klimatizace'],
      contactEmail: 'events@penthousewenceslas.cz',
      contactPhone: '+420 608 123 789',
      status: 'active',
      manager: {
        connect: { id: manager1.id }
      },
    },
  ]

  // Create the additional venues
  for (const venueData of additionalVenues) {
    await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: {},
      create: {
        ...venueData,
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        ],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
    console.log('Additional venue created:', venueData.name)
  }

  console.log('Database seeded successfully!')
  console.log('Sample users created:')
  console.log('- Admin: admin@prostormat.cz / admin123')
  console.log('- Manager 1: terasa@example.com / manager123')
  console.log('- Manager 2: galerie@example.com / manager123')
  console.log('- Manager 3: skybar@example.com / manager123')
  console.log('- Ribs Manager: manager@ribsofprague.cz / manager123')
  console.log('- Malvaze Manager: events@umalvaze.cz / manager123')
  console.log('- Medusa Manager: booking@medusaprague.com / manager123')
  console.log('- Pop Up Manager: info@popupbar.cz / manager123')
  console.log('- User: user@example.com / user123')
  console.log('- Test User: test@test.com / 12345')
  console.log('')
  console.log('Test venues created:')
  console.log('- Ribs of Prague (active)')
  console.log('- U Malvaze (draft)')
  console.log('- Medusa Prague (active)')
  console.log('- Pop Up Bar (draft)')
  console.log('')
  console.log('Sample inquiries created for testing admin functionality')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })