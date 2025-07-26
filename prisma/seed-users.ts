import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test users...')

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('123456', 12)

  // Create test user (regular user looking for locations)
  const testUser = await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: {},
    create: {
      email: 'user@user.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'user',
      company: 'Event Planning Co.',
    },
  })

  // Create location manager
  const locationManager = await prisma.user.upsert({
    where: { email: 'manager@user.com' },
    update: {},
    create: {
      email: 'manager@user.com',
      name: 'Location Manager',
      password: hashedPassword,
      role: 'venue_manager',
      company: 'Prague Venues Ltd.',
    },
  })

  // Create main admin user
  const mainAdmin = await prisma.user.upsert({
    where: { email: 'mark.muron@gmail.com' },
    update: {},
    create: {
      email: 'mark.muron@gmail.com',
      name: 'Mark Muron',
      password: hashedPassword,
      role: 'admin',
      company: 'Prostormat',
    },
  })

  // Create sample venues for the location manager
  const venue1 = await prisma.venue.upsert({
    where: { slug: 'modern-conference-center' },
    update: {},
    create: {
      name: 'Modern Conference Center',
      slug: 'modern-conference-center',
      description: 'Moderní konferenční centrum v srdci Prahy s nejnovějším technickým vybavením. Ideální pro firemní akce, konference a prezentace.',
      address: 'Wenceslas Square 1, Praha 1',
      capacitySeated: 200,
      capacityStanding: 300,
      venueType: 'konferencni-sal',
      amenities: ['Wi-Fi', 'Projektor', 'Zvukový systém', 'Klimatizace', 'Catering možnosti'],
      contactEmail: 'info@modernconference.cz',
      contactPhone: '+420 123 456 789',
      websiteUrl: 'https://modernconference.cz',
      images: [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'active',
      managerId: locationManager.id,
    },
  })

  const venue2 = await prisma.venue.upsert({
    where: { slug: 'elegant-ballroom' },
    update: {},
    create: {
      name: 'Elegant Ballroom',
      slug: 'elegant-ballroom',
      description: 'Elegantní taneční sál s historickým nádechem. Perfektní pro svatby, plesy a slavnostní večery.',
      address: 'Old Town Square 5, Praha 1',
      capacitySeated: 150,
      capacityStanding: 250,
      venueType: 'tancni-sal',
      amenities: ['Taneční parket', 'Osvětlení', 'Zvukový systém', 'Bar', 'Šatna'],
      contactEmail: 'bookings@elegantballroom.cz',
      contactPhone: '+420 987 654 321',
      websiteUrl: 'https://elegantballroom.cz',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'active',
      managerId: locationManager.id,
    },
  })

  const venue3 = await prisma.venue.upsert({
    where: { slug: 'rooftop-terrace' },
    update: {},
    create: {
      name: 'Rooftop Terrace',
      slug: 'rooftop-terrace',
      description: 'Střešní terasa s úžasným výhledem na Prahu. Ideální pro letní akce, koktejlové večírky a networkingové události.',
      address: 'Vinohrady District, Praha 2',
      capacitySeated: 80,
      capacityStanding: 120,
      venueType: 'venkovni-prostor',
      amenities: ['Výhled na město', 'Bar', 'Gril', 'Vytápění', 'Zastřešení'],
      contactEmail: 'events@rooftopterrace.cz',
      contactPhone: '+420 555 123 456',
      websiteUrl: 'https://rooftopterrace.cz',
      images: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'active',
      managerId: locationManager.id,
    },
  })

  // Create sample blog posts
  const blogPost1 = await prisma.blogPost.upsert({
    where: { slug: 'jak-vybrat-idealni-prostor-pro-firemni-akci' },
    update: {},
    create: {
      title: 'Jak vybrat ideální prostor pro firemní akci',
      slug: 'jak-vybrat-idealni-prostor-pro-firemni-akci',
      excerpt: 'Praktický průvodce výběrem správného prostoru pro vaši firemní akci. Tipy a triky od profesionálů.',
      content: `# Jak vybrat ideální prostor pro firemní akci

Výběr správného prostoru je klíčový pro úspěch jakékoli firemní akce. Zde je několik důležitých faktorů, které byste měli zvážit:

## 1. Kapacita a rozložení

Ujistěte se, že prostor pojme všechny vaše hosty pohodlně. Zvažte různé typy rozložení podle charakteru akce.

## 2. Lokalita a dostupnost

Vyberte prostor, který je snadno dostupný pro všechny účastníky. Myslete na parkování a MHD.

## 3. Technické vybavení

Zkontrolujte dostupnost AV techniky, Wi-Fi a dalšího potřebného vybavení.

## 4. Catering možnosti

Zjistěte, zda prostor nabízí catering nebo umožňuje externí dodavatele.

## 5. Rozpočet

Nezapomeňte na skryté náklady jako je úklid, bezpečnost nebo dodatečné služby.`,
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      status: 'published',
      authorId: mainAdmin.id,
      tags: '["firemní akce", "event planning", "tipy"]',
      metaTitle: 'Jak vybrat ideální prostor pro firemní akci - Prostormat',
      metaDescription: 'Praktický průvodce výběrem správného prostoru pro vaši firemní akci. Tipy a triky od profesionálů.',
      publishedAt: new Date(),
    },
  })

  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: 'trendy-v-organizaci-firemních-akcí-2024' },
    update: {},
    create: {
      title: 'Trendy v organizaci firemních akcí 2024',
      slug: 'trendy-v-organizaci-firemních-akcí-2024',
      excerpt: 'Objevte nejnovější trendy v organizaci firemních akcí a inspirujte se pro vaši příští událost.',
      content: `# Trendy v organizaci firemních akcí 2024

Rok 2024 přináší nové trendy v organizaci firemních akcí. Zde jsou ty nejdůležitější:

## 1. Hybridní akce

Kombinace prezenčních a online účastníků se stává standardem.

## 2. Udržitelnost

Ekologické akce s minimálním dopadem na životní prostředí.

## 3. Personalizace

Každý účastník má jedinečný zážitek přizpůsobený jeho potřebám.

## 4. Wellness aktivity

Integrace wellness prvků do firemních akcí pro lepší well-being zaměstnanců.

## 5. Technologické inovace

Využití AR/VR, AI a dalších technologií pro interaktivní zážitky.`,
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      status: 'published',
      authorId: mainAdmin.id,
      tags: '["trendy", "2024", "firemní akce", "inovace"]',
      metaTitle: 'Trendy v organizaci firemních akcí 2024 - Prostormat',
      metaDescription: 'Objevte nejnovější trendy v organizaci firemních akcí a inspirujte se pro vaši příští událost.',
      publishedAt: new Date(),
    },
  })

  const blogPost3 = await prisma.blogPost.upsert({
    where: { slug: 'nejlepší-prostory-pro-svatby-v-praze' },
    update: {},
    create: {
      title: 'Nejlepší prostory pro svatby v Praze',
      slug: 'nejlepší-prostory-pro-svatby-v-praze',
      excerpt: 'Průvodce nejkrásnějšími svatebními prostory v Praze. Od historických paláců po moderní venue.',
      content: `# Nejlepší prostory pro svatby v Praze

Praha nabízí nespočet krásných míst pro vaši vysněnou svatbu. Zde je výběr těch nejlepších:

## 1. Historické paláce

Zažijte pohádkovou svatbu v některém z pražských paláců s bohatou historií.

## 2. Moderní hotely

Luxusní hotely nabízejí kompletní svatební služby a profesionální přístup.

## 3. Zahrady a parky

Pro ty, kteří preferují venkovní svatby v přírodním prostředí.

## 4. Restaurace s výhledem

Romantické prostory s výhledem na Prahu pro nezapomenutelný večer.

## 5. Netradiční prostory

Galerie, lofty a další jedinečné prostory pro originální svatbu.`,
      coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      status: 'published',
      authorId: mainAdmin.id,
      tags: '["svatby", "Praha", "venue", "wedding"]',
      metaTitle: 'Nejlepší prostory pro svatby v Praze - Prostormat',
      metaDescription: 'Průvodce nejkrásnějšími svatebními prostory v Praze. Od historických paláců po moderní venue.',
      publishedAt: new Date(),
    },
  })

  console.log('✅ Test users created:')
  console.log('- Test User (user@user.com) - Role: user')
  console.log('- Location Manager (manager@user.com) - Role: venue_manager')
  console.log('- Main Admin (mark.muron@gmail.com) - Role: admin')
  console.log('✅ Sample venues created for location manager')
  console.log('✅ Sample blog posts created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
