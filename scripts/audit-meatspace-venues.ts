#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const remoteDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (!remoteDatabaseUrl) {
    throw new Error('No remote database connection string found in environment variables.')
  }

  process.env.DATABASE_URL = remoteDatabaseUrl
}

import { PrismaClient } from '@prisma/client'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// Define the venues we expect to find based on the URLs provided
const expectedVenues = [
  // Standalone venues
  { slug: 'hotel-sen', name: 'Hotel SEN' },
  { slug: 'kafkoff', name: 'Kafkoff' },
  { slug: 'bar-monk-prague', name: 'Bar Monk Prague' },
  { slug: 'boutique-hotel-jalta', name: 'Boutique Hotel Jalta' },
  { slug: 'prime-house-karlin', name: 'Prime House Karlín' },
  { slug: 'party-boxy-v-o2-arene-hc-sparta-praha', name: 'Party boxy v O2 aréně HC Sparta Praha' },
  { slug: 'kulinarni-studio-mafra', name: 'Kulinární studio MAFRA' },
  { slug: 'prague-city-golf-rohan', name: 'Prague City Golf Rohan' },
  { slug: 'prague-city-golf-zbraslav', name: 'Prague City Golf Zbraslav' },
  { slug: 'ice-arena-letnany', name: 'Ice Arena Letňany' },
  { slug: 'ice-arena-katerinky', name: 'Ice Arena Kateřinky' },
  { slug: 'tovarna-vir', name: 'Továrna VÍR' },
  { slug: 'revolution-train', name: 'Revolution Train' },
  { slug: 'restaurant-parnas', name: 'Restaurant Parnás' },
  { slug: 'bar-forbina', name: 'Bar Forbína' },
  { slug: 'areal-7', name: 'Areál 7' },
  { slug: 'pivnice-polepsovna', name: 'Pivnice Polepsovna' },
  { slug: 'corso-revnice', name: 'Corso Revnice' },
  { slug: 'mistnost-393', name: 'Místnost 393' },
  { slug: 'kaunicky-palac', name: 'Kaunický palác' },
  { slug: 'academy-hub-karlovy-vary', name: 'Academy Hub Karlovy Vary' },
  { slug: 'alforno-pizza-pasta', name: 'Alforno Pizza & Pasta' },
  { slug: 'demanova-rezort', name: 'Demänovä Rezort' },
  { slug: 'aparthotel-na-klenici', name: 'Aparthotel Na Klenící' },
  { slug: 'stodola-unetickeho-pivovaru', name: 'Stodola Únětického pivovaru' },
  { slug: 'mala-sin-galerie-manes', name: 'Malá síň Galerie Mánes' },
  { slug: 'sporthotel-slavia', name: 'Sporthotel Slávia' },
  { slug: 'll-gallery', name: 'LL Gallery' },
  { slug: 'molo-bar', name: 'Molo Bar' },
  { slug: 'planeta-za', name: 'Planeta ZA' },
  { slug: 'hudebni-skola-faktor-ucebny-koncertni-sal', name: 'Hudební škola Faktor - učebny & koncertní sál' },
  { slug: 'dum-u-cervene-lisky', name: 'Dům U červené lišky' },
  { slug: 'light-roast-coffee', name: 'Light Roast Coffee' },
  { slug: 'ctk-presscentrum', name: 'ČTK Presscentrum' },

  // Parent venues with children
  { slug: 'space-cafe-hub-karlin', name: 'Space Café & Hub Karlín', children: [
    { slug: 'berlin-meeting-room', name: 'Berlin Meeting Room' },
    { slug: 'milano-meeting-room', name: 'Milano Meeting Room' },
    { slug: 'paris-meeting-room', name: 'Paris Meeting Room' },
    { slug: 'prague-podcast-studio', name: 'Prague Podcast Studio' }
  ]},
  { slug: 'salabka-restaurace-vinarstvi-v-praze', name: 'Salabka - restaurace & vinařství v Praze' },
  { slug: 'dinosauria', name: 'Dinosauria', children: [
    { slug: 'firemni-akce', name: 'Firemní akce' },
    { slug: 'teambuilding-ve-virtualni-realite', name: 'Teambuilding ve virtuální realitě' },
    { slug: 'dinosauria-private-tour', name: 'Dinosauria Private Tour' },
    { slug: 'narozeninova-oslava-s-dinosaury', name: 'Narozeninová oslava s dinosaury' },
    { slug: 'vzdelavaci-program-pro-skoly', name: 'Vzdělávací program pro školy' },
    { slug: 'noc-v-muzeu', name: 'Noc v muzeu' },
    { slug: 'event-na-klic', name: 'Event na klíč' },
    { slug: 'poznavani-s-paleontologem', name: 'Poznávání s paleontologem' }
  ]},
  { slug: 'oaks-prague', name: 'Oaks Prague', children: [
    { slug: 'golfove-hriste-oaks-prague', name: 'Golfové hřiště Oaks Prague' },
    { slug: 'golfova-klubovna', name: 'Golfová klubovna' },
    { slug: 'la-bottega-oaks-deli-bistro', name: 'La Bottega Oaks Deli & Bistro' }
  ]},
  { slug: 'turquoise-prague', name: 'Turquoise Prague', children: [
    { slug: 'restaurant', name: 'Restaurant' },
    { slug: 'zahrada', name: 'Zahrada' },
    { slug: 'sal-v-muzeu', name: 'Sál v muzeu' }
  ]},
  { slug: 'muzeum-slivovice-r-jelinek', name: 'Muzeum Slivovice R. Jelínek', children: [
    { slug: 'muzeum-slivovice-r-jelinek-salonek-u-jelinka', name: 'Salónek U Jelínka' },
    { slug: 'muzeum-slivovice-r-jelinek-ochutnavkova-cast', name: 'Ochutnávková část' },
    { slug: 'muzeum-slivovice-r-jelinek-venkovni-prostor', name: 'Venkovní prostor' },
    { slug: 'muzeum-slivovice-r-jelinek-salonek-vizovice', name: 'Salónek Vizovice' },
    { slug: 'muzeum-slivovice-r-jelinek-salonek-kampa', name: 'Salónek Kampa' },
    { slug: 'muzeum-slivovice-r-jelinek-bar-a-klub', name: 'Bar a klub' }
  ]},
  { slug: 'all-in-event-space', name: 'All In Event Space', children: [
    { slug: 'konferencni-mistnosti-new-york', name: 'Konferenční místnosti New York' },
    { slug: 'konferencni-sal-sydney', name: 'Konferenční sál Sydney' },
    { slug: 'bistro-sworm', name: 'Bistro Sworm' }
  ]},
  { slug: 'stara-cistirna', name: 'Stará čistírna', children: [
    { slug: 'hlavni-hala', name: 'Hlavní hala' },
    { slug: 'galerie', name: 'Galerie' },
    { slug: 'puda', name: 'Půda' },
    { slug: 'strojovna-a-kotelna', name: 'Strojovna a kotelna' },
    { slug: 'sloupovy-sal', name: 'Sloupový sál' },
    { slug: 'sal-kalovych-cerpadel', name: 'Sál kalových čerpadel' },
    { slug: 'sal-lapace-pisku', name: 'Sál lapače písku' },
    { slug: 'puda-nad-kavarnou', name: 'Půda nad kavárnou' }
  ]},
  { slug: 'skoda-muzeum-mlada-boleslav', name: 'Škoda Muzeum Mladá Boleslav', children: [
    { slug: 'laurin-klement-forum', name: 'Laurin & Klement Forum' },
    { slug: 'hieronimus-i', name: 'Hieronimus I' }
  ]},
  { slug: 'majaland-praha', name: 'Majaland Praha', children: [
    { slug: 'firemni-akce-v-majalandu', name: 'Firemní akce v Majalandu' },
    { slug: 'majaland-family-day', name: 'Majaland Family Day' },
    { slug: 'pronajem-celeho-majalandu-pro-event', name: 'Pronájem celého Majalandu pro event' },
    { slug: 'narozeninova-oslava-s-vcelkou-majou', name: 'Narozeninová oslava s Včelkou Májou' }
  ]},
  { slug: 'pop-airport', name: 'POP Airport', children: [
    { slug: 'pop-outlet', name: 'POP Outlet' },
    { slug: 'pop-private-shopping', name: 'POP Private Shopping' },
    { slug: 'specialni-eventy-na-klic', name: 'Speciální eventy na klíč' },
    { slug: 'venkovni-prostory', name: 'Venkovní prostory' },
    { slug: 'parkoviste', name: 'Parkoviště' },
    { slug: 'pop-night-shopping-partner', name: 'POP Night Shopping Partner' },
    { slug: 'firemni-workshop-se-stylistkou', name: 'Firemní workshop se stylistkou' },
    { slug: 'vip-lounge', name: 'VIP Lounge' }
  ]},
  { slug: 'dancing-house-hotel', name: 'Dancing House Hotel', children: [
    { slug: 'restaurace-ginger-fred', name: 'Restaurace Ginger & Fred' },
    { slug: 'dancing-house-cafe', name: 'Dancing House Café' },
    { slug: 'zasedaci-mistnost', name: 'Zasedací místnost' },
    { slug: 'meeting-room', name: 'Meeting Room' }
  ]},
  { slug: 'chateau-st-havel', name: 'Chateau St. Havel', children: [
    { slug: 'zamecky-sal', name: 'Zámecký sál' },
    { slug: 'venkovni-stan', name: 'Venkovní stan' },
    { slug: 'restaurace-chateau-st-havel', name: 'Restaurace Chateau St. Havel' },
    { slug: 'kaple-sv-havla', name: 'Kaple sv. Havla' },
    { slug: 'salonek-i-salonek-ii', name: 'Salónek I & Salónek II' },
    { slug: 'zamecky-park', name: 'Zámecký park' },
    { slug: 'golf', name: 'Golf' },
    { slug: 'wellness', name: 'Wellness' }
  ]},
  { slug: 'restaurace-gutovka-areal-gutovka', name: 'Restaurace Gutovka & areál Gutovka', children: [
    { slug: 'restaurace', name: 'Restaurace' },
    { slug: 'galerie-restaurace', name: 'Galerie restaurace' },
    { slug: 'vez-restaurace', name: 'Věž restaurace' },
    { slug: 'stresni-terasa', name: 'Střešní terasa' },
    { slug: 'coffee-cocktail', name: 'Coffee & Cocktail' },
    { slug: 'grill-chill-zahradka', name: 'Grill & Chill Zahrádka' },
    { slug: 'firemni-vecirky', name: 'Firemní večírky' },
    { slug: 'teambuilding', name: 'Teambuilding' },
    { slug: 'narozeninove-a-detske-oslavy', name: 'Narozeninové a dětské oslavy' },
    { slug: 'turnaje-pro-skoly-a-firmy', name: 'Turnaje pro školy a firmy' }
  ]}
]

async function auditVenues() {
  console.log('🔍 Starting venue audit...\n')

  // Fetch all venues from database
  const allVenues = await prisma.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      district: true,
      images: true,
      parentId: true,
      parent: {
        select: {
          slug: true,
          name: true
        }
      }
    }
  })

  console.log(`📊 Total venues in database: ${allVenues.length}\n`)

  // Check which expected venues exist
  const foundVenues: string[] = []
  const missingVenues: string[] = []
  const venuesWithTooManyImages: Array<{ slug: string, imageCount: number }> = []
  const venuesWithNoImages: string[] = []
  const venuesOutsidePrague: Array<{ slug: string, district: string | null }> = []

  // Helper function to check a single venue
  const checkVenue = (expectedSlug: string, expectedName: string, parentSlug?: string) => {
    const venue = allVenues.find(v => v.slug === expectedSlug)

    if (venue) {
      foundVenues.push(expectedSlug)

      // Check image count
      const imageCount = venue.images.length
      if (imageCount > 30) {
        venuesWithTooManyImages.push({ slug: expectedSlug, imageCount })
      }
      if (imageCount === 0) {
        venuesWithNoImages.push(expectedSlug)
      }

      // Check location (should contain Praha, Prague, or be in Czech Republic regions)
      const district = venue.district?.toLowerCase() || ''
      const address = venue.address?.toLowerCase() || ''

      const isPrague = district.includes('praha') || district.includes('prague') ||
                      address.includes('praha') || address.includes('prague')
      const isCzechRegion = district.includes('kraj') || district.includes('vary') ||
                           district.includes('boleslav') || district.includes('středočeský')

      if (!isPrague && !isCzechRegion) {
        venuesWithNoImages.push(expectedSlug)
      }
    } else {
      missingVenues.push(`${expectedSlug} (${expectedName})`)
    }
  }

  // Check all expected venues
  for (const venue of expectedVenues) {
    checkVenue(venue.slug, venue.name)

    if (venue.children) {
      for (const child of venue.children) {
        checkVenue(child.slug, child.name, venue.slug)
      }
    }
  }

  // Report findings
  console.log('✅ FOUND VENUES:', foundVenues.length)
  console.log('❌ MISSING VENUES:', missingVenues.length)
  if (missingVenues.length > 0) {
    console.log('Missing:')
    missingVenues.forEach(v => console.log(`  - ${v}`))
  }
  console.log()

  console.log('📸 VENUES WITH TOO MANY IMAGES (>30):', venuesWithTooManyImages.length)
  if (venuesWithTooManyImages.length > 0) {
    venuesWithTooManyImages.forEach(v => console.log(`  - ${v.slug}: ${v.imageCount} images`))
  }
  console.log()

  console.log('🖼️  VENUES WITH NO IMAGES:', venuesWithNoImages.length)
  if (venuesWithNoImages.length > 0) {
    venuesWithNoImages.forEach(v => console.log(`  - ${v}`))
  }
  console.log()

  console.log('🌍 VENUES OUTSIDE PRAGUE/CZECH REGIONS:', venuesOutsidePrague.length)
  if (venuesOutsidePrague.length > 0) {
    venuesOutsidePrague.forEach(v => console.log(`  - ${v.slug}: ${v.district}`))
  }
  console.log()

  // Check image folders
  console.log('📁 Checking image folders in Prostory/prostory_images/...\n')
  const imagesDir = join(process.cwd(), 'Prostory', 'prostory_images')

  try {
    const folders = readdirSync(imagesDir).filter(f => {
      const stat = statSync(join(imagesDir, f))
      return stat.isDirectory()
    })

    console.log(`Found ${folders.length} image folders\n`)

    // Check which venues have matching image folders
    const venuesWithFolders: string[] = []
    const venuesWithoutFolders: string[] = []

    for (const venue of foundVenues) {
      const hasFolder = folders.some(f => f === venue || f.startsWith(venue))
      if (hasFolder) {
        venuesWithFolders.push(venue)
      } else {
        venuesWithoutFolders.push(venue)
      }
    }

    console.log('📦 VENUES WITH IMAGE FOLDERS:', venuesWithFolders.length)
    console.log('📭 VENUES WITHOUT IMAGE FOLDERS:', venuesWithoutFolders.length)
    if (venuesWithoutFolders.length > 0) {
      console.log('Missing folders:')
      venuesWithoutFolders.forEach(v => console.log(`  - ${v}`))
    }

  } catch (error) {
    console.error('Error reading image folders:', error)
  }

  console.log('\n✨ Audit complete!')
}

auditVenues()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
