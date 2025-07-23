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

  // Create venue manager
  const managerPassword = await bcrypt.hash('manager123', 12)
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Venue Manager',
      password: managerPassword,
      role: 'venue_manager',
      phone: '+420 222 333 444',
    },
  })

  // Create sample venues with correct JSON string format
  const venues = [
    {
      name: 'Restaurant Terasa',
      slug: 'restaurant-terasa',
      description: 'Elegantní restaurace s výhledem na Pražský hrad, ideální pro firemní akce a slavnostní večery.',
      address: 'Kampa Island 1, Praha 1',
      capacitySeated: 80,
      capacityStanding: 120,
      venueType: 'restaurant',
      amenities: JSON.stringify(['Klimatizace', 'Projektor', 'Zvukový systém', 'WiFi', 'Terasa', 'Parking']),
      contactEmail: 'info@restaurant-terasa.cz',
      contactPhone: '+420 222 333 444',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Galerie Moderna',
      slug: 'galerie-moderna',
      description: 'Moderní galerie v centru Prahy s flexibilními prostory pro konference, výstavy a networking events.',
      address: 'Národní 20, Praha 1',
      capacitySeated: 150,
      capacityStanding: 250,
      venueType: 'gallery',
      amenities: JSON.stringify(['Multimediální vybavení', 'Catering možnosti', 'Výstavní systém', 'Klimatizace']),
      contactEmail: 'rezervace@galerie-moderna.cz',
      contactPhone: '+420 111 222 333',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'SkyBar Prague',
      slug: 'skybar-prague',
      description: 'Exkluzivní střešní terasa s panoramatickým výhledem na Prahu. Perfektní pro cocktail party a letní akce.',
      address: 'Wenceslas Square 14, Praha 1',
      capacitySeated: 60,
      capacityStanding: 100,
      venueType: 'rooftop',
      amenities: JSON.stringify(['Bar', 'DJ booth', 'Vytápění', 'Zastřešená část', 'VIP sekce', 'Výhled na město']),
      contactEmail: 'events@skybar-prague.com',
      contactPhone: '+420 777 888 999',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Conference Center Prague',
      slug: 'conference-center-prague',
      description: 'Moderní konferenční centrum s nejnovější technologií pro firemní akce a semináře.',
      address: 'Karlovo náměstí 5, Praha 2',
      capacitySeated: 200,
      capacityStanding: 300,
      venueType: 'conference',
      amenities: JSON.stringify(['Projektor', 'Zvukový systém', 'WiFi', 'Klimatizace', 'Catering', 'Parking']),
      contactEmail: 'info@conference-prague.cz',
      contactPhone: '+420 555 666 777',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Garden Villa Petřín',
      slug: 'garden-villa-petrin',
      description: 'Romantická zahradní vila pod Petřínem s krásnou zahradou pro svatby a soukromé akce.',
      address: 'Petřínské sady 15, Praha 1',
      capacitySeated: 50,
      capacityStanding: 80,
      venueType: 'garden',
      amenities: JSON.stringify(['Zahrada', 'Terasa', 'Gril', 'Parkování', 'Dětské hřiště']),
      contactEmail: 'rezervace@villa-petrin.cz',
      contactPhone: '+420 333 444 555',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Industrial Loft Karlín',
      slug: 'industrial-loft-karlin',
      description: 'Industriální loft v Karlíně s vysokými stropy a moderním designem pro kreativní akce.',
      address: 'Sokolovská 100, Praha 8',
      capacitySeated: 120,
      capacityStanding: 180,
      venueType: 'loft',
      amenities: JSON.stringify(['Vysoké stropy', 'Industriální design', 'Projektor', 'Zvukový systém', 'WiFi']),
      contactEmail: 'booking@loft-karlin.cz',
      contactPhone: '+420 666 777 888',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'active',
      managerId: manager1.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  ]

  // Create venues
  for (const venueData of venues) {
    await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: {},
      create: venueData,
    })
    console.log(`Created venue: ${venueData.name}`)
  }

  console.log('Database seeded successfully!')
  console.log('Sample users created:')
  console.log('- Admin: admin@prostormat.cz / admin123')
  console.log('- Manager: manager@example.com / manager123')
  console.log(`${venues.length} venues created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
