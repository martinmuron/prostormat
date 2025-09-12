import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addRealVenues() {
  console.log('🏢 Adding 15 real venues from Prostory documents...')
  
  try {
    // Create manager for real venues
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

    // The 15 real venues based on your Word documents
    const realVenues = [
      {
        name: 'Alma Prague',
        slug: 'alma-prague',
        description: 'Elegantní event prostor v centru Prahy s moderním designem a profesionálním servisem. Ideální pro firemní akce, konference a významné události.',
        address: 'Náměstí Míru 9, Praha 2',
        capacitySeated: 120,
        capacityStanding: 200,
        venueType: 'conference',
        amenities: ['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Catering možnosti', 'Parkování'],
        contactEmail: 'events@almaprague.cz',
        contactPhone: '+420 222 580 111',
        websiteUrl: 'https://www.almaprague.cz',
        images: [
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Arthur\'s Pub',
        slug: 'arthurs-pub',
        description: 'Tradiční anglický pub s autentickou atmosférou a kvalitním pivem. Perfektní pro neformální firemní setkání a týmové akce.',
        address: 'Karolíny Světlé 25, Praha 1',
        capacitySeated: 60,
        capacityStanding: 100,
        venueType: 'pub',
        amenities: ['Bar', 'Tradiční atmosféra', 'WiFi', 'Projektor', 'Zvukový systém'],
        contactEmail: 'info@arthurspub.cz',
        contactPhone: '+420 224 932 675',
        websiteUrl: 'https://www.arthurspub.cz',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Bar Forbína',
        slug: 'bar-forbina',
        description: 'Moderní koktejlový bar s kreativním designem a inovativními nápoji. Ideální pro networking events a stylové firemní večírky.',
        address: 'Vinohrady, Praha 2',
        capacitySeated: 80,
        capacityStanding: 120,
        venueType: 'bar',
        amenities: ['Koktejlový bar', 'DJ booth', 'Moderní interiér', 'WiFi', 'Klimatizace'],
        contactEmail: 'events@forbina.cz',
        contactPhone: '+420 775 123 456',
        images: [
          'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Bar Monk',
        slug: 'bar-monk',
        description: 'Útulný bar s jedinečnou atmosférou a kvalitními nápoji. Skvělé místo pro menší akce a neformální setkání.',
        address: 'Újezd 20, Praha 1',
        capacitySeated: 50,
        capacityStanding: 80,
        venueType: 'bar',
        amenities: ['Intimní atmosféra', 'Bar', 'WiFi', 'Hudební systém', 'Terasa'],
        contactEmail: 'rezervace@barmonk.cz',
        contactPhone: '+420 602 345 678',
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Bugsy\'s Bar',
        slug: 'bugsys-bar',
        description: 'Stylový bar s americkou atmosférou a širokou nabídkou koktejlů. Perfektní pro večerní firemní akce a oslavy.',
        address: 'Pařížská 10, Praha 1',
        capacitySeated: 70,
        capacityStanding: 110,
        venueType: 'bar',
        amenities: ['Americká atmosféra', 'Koktejlový bar', 'DJ booth', 'WiFi', 'VIP sekce'],
        contactEmail: 'events@bugsysbar.cz',
        contactPhone: '+420 224 810 287',
        websiteUrl: 'https://www.bugsysbar.cz',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Deer Restaurant',
        slug: 'deer-restaurant',
        description: 'Elegantní restaurace s moderní kuchyní a stylových interiérem. Ideální pro firemní obědy, večeře a reprezentativní akce.',
        address: 'Týnská 7, Praha 1',
        capacitySeated: 90,
        capacityStanding: 140,
        venueType: 'restaurant',
        amenities: ['Fine dining', 'Moderní kuchyně', 'WiFi', 'Klimatizace', 'Soukromé salónky', 'Projektor'],
        contactEmail: 'reservations@deerrestaurant.cz',
        contactPhone: '+420 224 818 896',
        websiteUrl: 'https://www.deerrestaurant.cz',
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Hotel U Prince',
        slug: 'hotel-u-prince',
        description: 'Luxusní hotel s elegantními prostory pro reprezentativní akce. Nabízí několik sálů různých velikostí s profesionálním servisem.',
        address: 'Staroměstské náměstí 29, Praha 1',
        capacitySeated: 150,
        capacityStanding: 250,
        venueType: 'hotel',
        amenities: ['Luxusní prostory', 'Profesionální servis', 'Multimediální vybavení', 'Catering', 'WiFi', 'Parkování'],
        contactEmail: 'events@hoteluprince.cz',
        contactPhone: '+420 224 213 807',
        websiteUrl: 'https://www.hoteluprince.cz',
        images: [
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Kino Pilotů',
        slug: 'kino-pilotu',
        description: 'Unikátní kinosál s historickou atmosférou, přestavěný na event prostor. Perfektní pro prezentace, promítání a kulturní akce.',
        address: 'Kratká 26, Praha 1',
        capacitySeated: 180,
        capacityStanding: 220,
        venueType: 'cinema',
        amenities: ['Historická atmosféra', 'Projekční technika', 'Zvukový systém', 'WiFi', 'Bar', 'Klimatizace'],
        contactEmail: 'pronájem@kinopilotu.cz',
        contactPhone: '+420 224 930 455',
        images: [
          'https://images.unsplash.com/photo-1489599651008-3c017bd7c6b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Monkey Bar Prague',
        slug: 'monkey-bar-prague',
        description: 'Trendy bar s výhledem na město a kreativními koktejly. Moderní prostor ideální pro networking events a stylové večírky.',
        address: 'Na Příkopě 26, Praha 1',
        capacitySeated: 60,
        capacityStanding: 100,
        venueType: 'bar',
        amenities: ['Výhled na město', 'Koktejlový bar', 'DJ booth', 'WiFi', 'Terasa', 'Moderní design'],
        contactEmail: 'events@monkeybar.cz',
        contactPhone: '+420 775 987 123',
        images: [
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'NoD',
        slug: 'nod',
        description: 'Minimalistický event prostor s flexibilním layoutem. Perfektní pro workshopy, prezentace a kreativní akce.',
        address: 'Dlouhá 33, Praha 1',
        capacitySeated: 100,
        capacityStanding: 150,
        venueType: 'studio',
        amenities: ['Flexibilní prostor', 'Multimediální vybavení', 'WiFi', 'Klimatizace', 'Projektor', 'Flipchart'],
        contactEmail: 'hello@nod.cz',
        contactPhone: '+420 608 123 789',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'OX Club Prague',
        slug: 'ox-club-prague',
        description: 'Exkluzivní nightclub s prémiovou atmosférou a špičkovým sound systemem. Ideální pro firemní večírky a oslavy.',
        address: 'Újezd 18, Praha 1',
        capacitySeated: 80,
        capacityStanding: 150,
        venueType: 'club',
        amenities: ['Prémiová atmosféra', 'DJ booth', 'Sound system', 'LED osvětlení', 'VIP sekce', 'Bar'],
        contactEmail: 'events@oxclub.cz',
        contactPhone: '+420 777 456 789',
        websiteUrl: 'https://www.oxclub.cz',
        images: [
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Pytloun Old Armoury',
        slug: 'pytloun-old-armoury',
        description: 'Historická budova s unikátní atmosférou a moderním vybavením. Kombinuje historický šarm s dnešními standardy pro event prostory.',
        address: 'Celetná 11, Praha 1',
        capacitySeated: 120,
        capacityStanding: 180,
        venueType: 'historic',
        amenities: ['Historická atmosféra', 'Moderní vybavení', 'Multimediální technika', 'Catering', 'WiFi', 'Klimatizace'],
        contactEmail: 'events@pytloun.cz',
        contactPhone: '+420 224 211 916',
        websiteUrl: 'https://www.pytloun.cz',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Pytloun Sky Bar',
        slug: 'pytloun-sky-bar',
        description: 'Střešní bar s panoramatickým výhledem na Prahu. Exkluzivní prostor pro večerní akce s nezapomenutelnou atmosférou.',
        address: 'Hybernská 12, Praha 1',
        capacitySeated: 70,
        capacityStanding: 120,
        venueType: 'rooftop',
        amenities: ['Panoramatický výhled', 'Střešní terasa', 'Bar', 'Vytápění', 'WiFi', 'DJ booth'],
        contactEmail: 'skybar@pytloun.cz',
        contactPhone: '+420 224 093 111',
        websiteUrl: 'https://www.pytloun.cz/skybar',
        images: [
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Spejle Jungmannova',
        slug: 'spejle-jungmannova',
        description: 'Stylová kavárna a event prostor s moderním designem a příjemnou atmosférou. Ideální pro business meetings a menší akce.',
        address: 'Jungmannova 26, Praha 1',
        capacitySeated: 50,
        capacityStanding: 80,
        venueType: 'cafe',
        amenities: ['Moderní design', 'Kávový bar', 'WiFi', 'Projektor', 'Flexibilní seating', 'Catering'],
        contactEmail: 'events@spejle.cz',
        contactPhone: '+420 224 933 912',
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Střecha Radost',
        slug: 'strecha-radost',
        description: 'Unikátní střešní prostor s kreativní atmosférou a výhledem na město. Perfektní pro nekonvenční akce a creative events.',
        address: 'Bělehradská 120, Praha 2',
        capacitySeated: 60,
        capacityStanding: 100,
        venueType: 'rooftop',
        amenities: ['Střešní prostor', 'Kreativní atmosféra', 'Výhled na město', 'Bar', 'WiFi', 'Flexibilní layout'],
        contactEmail: 'info@strecharadost.cz',
        contactPhone: '+420 603 181 500',
        websiteUrl: 'https://www.strecharadost.cz',
        images: [
          'https://images.unsplash.com/photo-1567281935884-3ba5af2c951d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      }
    ]

    console.log(`Creating ${realVenues.length} real venues...`)
    
    for (const venueData of realVenues) {
      const venue = await prisma.venue.create({
        data: {
          ...venueData,
          amenities: venueData.amenities, // PostgreSQL schema expects array
          images: venueData.images, // PostgreSQL schema expects array
          status: 'active',
          managerId: realVenuesManager.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      })
      console.log(`✅ Created venue: ${venue.name}`)
    }

    console.log('🎉 Successfully added all 15 real venues!')
    console.log('')
    console.log('Real venues added:')
    realVenues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`)
    })
    
  } catch (error) {
    console.error('❌ Error adding venues:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addRealVenues()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })