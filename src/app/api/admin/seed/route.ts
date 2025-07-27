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
    const existingPosts = await prisma.blogPost.count()
    
    if (existingVenues > 0 && existingPosts > 0) {
      return NextResponse.json({
        message: "Database already seeded",
        existingVenues,
        existingPosts
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
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
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
      },
      {
        name: 'Palác Vinohrady',
        slug: 'palac-vinohrady',
        description: 'Elegantní palác s historickou atmosférou, ideální pro svatby a gala večery.',
        address: 'Náměstí Míru 15, Praha 2',
        capacitySeated: 200,
        capacityStanding: 300,
        venueType: 'palace',
        amenities: ['Historické sály', 'Klavír', 'Catering servis', 'Parkování', 'Klimatizace'],
        contactEmail: 'rezervace@palacvinohrady.cz',
        contactPhone: '+420 296 826 111',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Boutique Hotel Constans',
        slug: 'boutique-hotel-constans',
        description: 'Luxusní boutique hotel s elegantními salonky pro business meetingy.',
        address: 'Pařížská 30, Praha 1',
        capacitySeated: 40,
        capacityStanding: 65,
        venueType: 'hotel',
        amenities: ['WiFi', 'Projektor', 'Catering', 'Concierge služby', 'VIP lounge'],
        contactEmail: 'events@hotelconstans.cz',
        contactPhone: '+420 234 091 818',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'Letná Beer Garden',
        slug: 'letna-beer-garden',
        description: 'Prostorná pivní zahrada s výhledem na Prahu, perfektní pro letní akce.',
        address: 'Letná Park 5, Praha 7',
        capacitySeated: 120,
        capacityStanding: 200,
        venueType: 'garden',
        amenities: ['Venkovní terasa', 'Gril', 'Bar', 'Výhled na město', 'Parkování'],
        contactEmail: 'info@letnagarden.cz',
        contactPhone: '+420 606 789 123',
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      },
      {
        name: 'Centrum Karlovo náměstí',
        slug: 'centrum-karlovo-namesti',
        description: 'Moderní konferenční centrum s nejnovějšími technologiemi.',
        address: 'Karlovo náměstí 40, Praha 2',
        capacitySeated: 300,
        capacityStanding: 450,
        venueType: 'conference',
        amenities: ['4K projekce', 'Simultánní překlad', 'Live streaming', 'Catering', 'Metro stanice'],
        contactEmail: 'rezervace@centrokn.cz',
        contactPhone: '+420 224 915 865',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Studio Vinohrady',
        slug: 'studio-vinohrady',
        description: 'Kreativní studio pro workshopy, přednášky a networking akce.',
        address: 'Vinohrady Square 25, Praha 3',
        capacitySeated: 50,
        capacityStanding: 80,
        venueType: 'studio',
        amenities: ['Flexibilní uspořádání', 'Whiteboard', 'WiFi', 'Kuchyňka', 'Zvukový systém'],
        contactEmail: 'hello@studiovinohrady.cz',
        contactPhone: '+420 775 432 198',
        images: [
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'Malostranský palác',
        slug: 'malostranske-palace',
        description: 'Barokní palác v srdci Malé Strany s autentickou atmosférou.',
        address: 'Malá Strana 18, Praha 1',
        capacitySeated: 150,
        capacityStanding: 220,
        venueType: 'palace',
        amenities: ['Historické prostory', 'Zahrada', 'Parkování', 'Catering partner', 'Klavír'],
        contactEmail: 'events@malostranske-palace.cz',
        contactPhone: '+420 257 075 711',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      },
      {
        name: 'Rooftop Bar Skyline',
        slug: 'rooftop-bar-skyline',
        description: 'Moderní střešní bar s panoramatickým výhledem na celou Prahu.',
        address: 'Na Příkopě 32, Praha 1',
        capacitySeated: 90,
        capacityStanding: 140,
        venueType: 'rooftop',
        amenities: ['Bar', 'DJ prostor', 'Výhled na město', 'Klimatizace', 'Elevator'],
        contactEmail: 'events@rooftopskyline.cz',
        contactPhone: '+420 224 567 890',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Industrial Loft Karlín',
        slug: 'industrial-loft-karlin',
        description: 'Prostorný industriální loft v trendy čtvrti Karlín pro kreativní akce.',
        address: 'Sokolovská 100, Praha 8',
        capacitySeated: 120,
        capacityStanding: 180,
        venueType: 'loft',
        amenities: ['Vysoké stropy', 'Industriální design', 'Projekce', 'Catering kuchyň'],
        contactEmail: 'info@industrialloft.cz',
        contactPhone: '+420 775 123 456',
        images: [
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'Garden Villa Petřín',
        slug: 'garden-villa-petrin',
        description: 'Romantická vila s krásnou zahradou pod Petřínem pro svatby a oslavy.',
        address: 'Petřínské sady 15, Praha 5',
        capacitySeated: 80,
        capacityStanding: 120,
        venueType: 'villa',
        amenities: ['Zahrada', 'Terasa', 'Parkování', 'Piano', 'Květinové záhony'],
        contactEmail: 'rezervace@gardenvilla.cz',
        contactPhone: '+420 602 345 678',
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      },
      {
        name: 'Tech Hub Smíchov',
        slug: 'tech-hub-smichov',
        description: 'Moderní technologické centrum pro konference a product launch eventy.',
        address: 'Anděl City, Praha 5',
        capacitySeated: 200,
        capacityStanding: 300,
        venueType: 'conference',
        amenities: ['4K projekce', 'Live streaming', 'High-speed WiFi', 'Tech podpora'],
        contactEmail: 'events@techhub.cz',
        contactPhone: '+420 234 567 891',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Art Studio Vinohrady',
        slug: 'art-studio-vinohrady',
        description: 'Umělecký ateliér s jedinečnou atmosférou pro workshopy a výstavy.',
        address: 'Korunní 45, Praha 2',
        capacitySeated: 40,
        capacityStanding: 60,
        venueType: 'studio',
        amenities: ['Umělecké vybavení', 'Přirozené světlo', 'Flexibilní prostory'],
        contactEmail: 'hello@artstudio.cz',
        contactPhone: '+420 777 234 567',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      },
      {
        name: 'Luxury Hotel Ballroom',
        slug: 'luxury-hotel-ballroom',
        description: 'Luxusní ballroom v pětihvězdičkovém hotelu pro prestižní akce.',
        address: 'Národní třída 38, Praha 1',
        capacitySeated: 300,
        capacityStanding: 450,
        venueType: 'hotel',
        amenities: ['Kristalové lustry', 'Live hudba', 'Gourmet catering', 'Concierge'],
        contactEmail: 'events@luxuryhotel.cz',
        contactPhone: '+420 296 123 456',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager3.id,
      },
      {
        name: 'Riverside Terrace',
        slug: 'riverside-terrace',
        description: 'Romantická terasa u Vltavy s výhledem na Karlův most.',
        address: 'Kampa Island 8, Praha 1',
        capacitySeated: 60,
        capacityStanding: 90,
        venueType: 'restaurant',
        amenities: ['Výhled na řeku', 'Venkovní topení', 'Boat parking', 'Terasa'],
        contactEmail: 'info@riversideterrace.cz',
        contactPhone: '+420 224 789 123',
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager1.id,
      },
      {
        name: 'Modern Gallery Space',
        slug: 'modern-gallery-space',
        description: 'Současná galerie s čistými liniemi pro výstavy a vernisáže.',
        address: 'Wenceslas Square 25, Praha 1',
        capacitySeated: 100,
        capacityStanding: 150,
        venueType: 'gallery',
        amenities: ['Výstavní systém', 'Profesionální osvětlení', 'Sound system'],
        contactEmail: 'gallery@modernspace.cz',
        contactPhone: '+420 775 456 789',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        status: 'active',
        managerId: manager2.id,
      }
    ]

    // Create venues (only if they don't exist)
    const createdVenues = []
    if (existingVenues === 0) {
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
    } else {
      // Get existing venues for response
      const existingVenuesList = await prisma.venue.findMany({
        select: { id: true, name: true, slug: true }
      })
      createdVenues.push(...existingVenuesList)
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

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@prostormat.cz' },
      update: {},
      create: {
        email: 'admin@prostormat.cz',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin',
      },
    })

    // Create blog posts
    const blogPosts = [
      {
        title: 'Jak vybrat perfektní event prostor v Praze',
        slug: 'jak-vybrat-perfektni-event-prostor-v-praze',
        excerpt: 'Praktický průvodce výběrem ideálního prostoru pro vaši firemní akci, oslavu nebo konferenci.',
        content: `# Jak vybrat perfektní event prostor v Praze

Výběr správného prostoru je klíčem k úspěchu každé akce. Ať už plánujete firemní večírek, konferenci nebo rodinnou oslavu, existuje několik důležitých faktorů, které byste měli zvážit.

## 1. Určete si kapacitu

Prvním krokem je stanovení počtu hostů. Nezapomeňte počítat s:
- Organizátory a obsluhou
- Možným navýšením počtu účastníků
- Potřebou prostoru pro catering a vybavení

## 2. Lokalita je klíčová

Praha nabízí nespočet možností:
- **Praha 1**: Prestižní lokace v centru města
- **Praha 2**: Vinohrady s moderními prostory
- **Praha 5**: Smíchov s výhledem na město

## 3. Rozpočet a služby

Stanovte si jasný rozpočet a zjistěte:
- Co je v ceně zahrnuto
- Jaké služby si můžete dokoupit
- Možnosti platebních podmínek

Správný výběr prostoru může vaši akci povznést na novou úroveň!`,
        coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'published',
        tags: JSON.stringify(['event planning', 'Praha', 'prostory']),
        metaTitle: 'Jak vybrat perfektní event prostor v Praze - Prostormat',
        metaDescription: 'Praktický průvodce výběrem ideálního prostoru pro vaši firemní akci, oslavu nebo konferenci v Praze.',
        authorId: adminUser.id,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: 'Trendy v event managementu pro rok 2025',
        slug: 'trendy-v-event-managementu-pro-rok-2025',
        excerpt: 'Objevte nejnovější trendy v pořádání akcí a získejte inspiraci pro vaše budoucí eventy.',
        content: `# Trendy v event managementu pro rok 2025

Event industry se neustále vyvíjí a rok 2025 přináší řadu zajímavých trendů, které stojí za pozornost.

## Udržitelnost na prvním místě

Organizátoři stále více kladou důraz na:
- Eco-friendly prostory
- Lokální dodavatele
- Zero waste akce
- Digitální materiály místo tištěných

## Hybridní akce jako standard

Kombinace fyzické a online účasti se stává normou:
- Širší dosah publika
- Flexibilita pro účastníky
- Nižší náklady na cestování

## Personalizace zážitků

Moderní technologie umožňují:
- AI-driven doporučení
- Interaktivní prvky
- Customizované programy
- Real-time feedback

## Wellness a well-being

Akce se zaměřují na pohodu účastníků:
- Mindfulness aktivity
- Zdravé občerstvení
- Relaxační zóny
- Work-life balance

Sledujte tyto trendy a vaše akce budou vždy o krok napřed!`,
        coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'published',
        tags: JSON.stringify(['trendy', 'event management', '2025']),
        metaTitle: 'Trendy v event managementu pro rok 2025 - Prostormat',
        metaDescription: 'Objevte nejnovější trendy v pořádání akcí a získejte inspiraci pro vaše budoucí eventy v roce 2025.',
        authorId: adminUser.id,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: 'Nejlepší venue typy pro firemní akce',
        slug: 'nejlepsi-venue-typy-pro-firemni-akce',
        excerpt: 'Přehled různých typů prostorů a jejich vhodnosti pro různé druhy firemních akcí.',
        content: `# Nejlepší venue typy pro firemní akce

Každý typ firemní akce vyžaduje jiný přístup k výběru prostoru. Zde je přehled nejoblíbenějších venue typů a jejich využití.

## Konferenční centra

Ideální pro:
- Velké konference a semináře
- Product launch events
- Školení a workshopy

**Výhody:** Kompletní technické vybavení, profesionální servis
**Nevýhody:** Vyšší cena, méně osobní atmosféra

## Galerie a muzea

Perfektní pro:
- Networking eventy
- Cocktail party
- Prezentace produktů

**Výhody:** Jedinečná atmosféra, kulturní prestiž
**Nevýhody:** Omezení ohledně cateringu a dekorace

## Střešní terasy

Skvělé pro:
- Letní firemní večírky
- Team building aktivity
- Neformální setkání

**Výhody:** Výhled na město, outdoor atmosféra
**Nevýhody:** Závislost na počasí

## Industriální prostory

Trendy volba pro:
- Start-up eventy
- Kreativní workshopy
- Nekonvenční konference

**Výhody:** Flexibilita, moderní vzhled
**Nevýhody:** Nutnost dodatečné výzdoby

## Hotely

Univerzální řešení pro:
- Vícedenní konference
- Incentive pobyty
- Formální bankety

**Výhody:** Komplexní služby, ubytování
**Nevýhody:** Standardní prostředí

Výběr správného venue typu může výrazně ovlivnit úspěch vaší akce!`,
        coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'published',
        tags: JSON.stringify(['venue typy', 'firemní akce', 'prostory']),
        metaTitle: 'Nejlepší venue typy pro firemní akce - Prostormat',
        metaDescription: 'Přehled různých typů prostorů a jejich vhodnosti pro různé druhy firemních akcí.',
        authorId: adminUser.id,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]

    // Create blog posts (only if they don't exist)
    const createdPosts = []
    if (existingPosts === 0) {
      for (const postData of blogPosts) {
        const post = await prisma.blogPost.create({
          data: postData
        })
        createdPosts.push(post)
        console.log('Created blog post:', post.title)
      }
    } else {
      // Get existing posts for response
      const existingPostsList = await prisma.blogPost.findMany({
        select: { id: true, title: true, slug: true }
      })
      createdPosts.push(...existingPostsList)
    }

    console.log('Database seeded successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      venuesCreated: createdVenues.length,
      venues: createdVenues.map(v => ({ id: v.id, name: v.name, slug: v.slug })),
      blogPostsCreated: createdPosts.length,
      blogPosts: createdPosts.map(p => ({ id: p.id, title: p.title, slug: p.slug }))
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