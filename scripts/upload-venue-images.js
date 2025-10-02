#!/usr/bin/env node

const path = require('path')
const fs = require('fs/promises')
const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load environment variables in priority order
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

function ensureEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Prefer the remote Supabase connection for Prisma if available
const remoteDatabaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
if (!process.env.DATABASE_URL || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
  if (remoteDatabaseUrl) {
    process.env.DATABASE_URL = remoteDatabaseUrl
  }
}

const SUPABASE_URL = ensureEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = ensureEnv('SUPABASE_SERVICE_ROLE_KEY')
const DATABASE_URL = ensureEnv('DATABASE_URL')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const prisma = new PrismaClient()

const IMAGE_ROOT = path.resolve(process.cwd(), 'Prostory', 'prostory_images')
const MAX_IMAGES_PER_VENUE = 30

const folderToSlugMap = {
  'alma-prague': 'alma-prague',
  'art-restaurant-manes': 'art-restaurant-manes',
  'arthurs': 'arthurs-pub',
  'bar-forbina': 'bar-forbina',
  'bar-monk-prague': 'bar-monk-prague',
  'bugsys-bar': 'bugsys-bar',
  'casablanca-sky-bar': 'casablanca-sky-bar',
  'cerveny-jelen': 'cerveny-jelen',
  'bar-klub-zlaty-strom': 'bar-klub-zlaty-strom',
  'berlin-meeting-room': 'space-cafe-hub-karlin-berlin',
  'all-in-event-space': 'all-in-event-space',
  'all-in-event-space-bistro-sworm': 'all-in-event-space-bistro-sworm',
  'all-in-event-space-konferencni-mistnosti-new-york': 'all-in-event-space-konferencni-mistnosti-new-york',
  'all-in-event-space-konferencni-sal-sydney': 'all-in-event-space-konferencni-sal-sydney',
  'boutique-hotel-jalta': 'boutique-hotel-jalta',
  'deer': 'deer-restaurant-prague',
  'dinosauria': 'dinosauria',
  'dinosauria-private-tour': 'dinosauria-private-tour',
  'event-na-klic': 'dinosauria-event-na-klic',
  'firemni-akce': 'dinosauria-firemni-akce',
  'forum-karlin': 'forum-karlin',
  'fu-club-prague': 'fu-club-prague',
  'golfova-klubovna': 'oaks-prague-golfova-klubovna',
  'golfove-hriste-oaks-prague': 'oaks-prague-golfove-hriste',
  'hard-rock-cafe-praha': 'hard-rock-cafe-prague',
  'hotel-sen': 'hotel-sen',
  'hotel-u-prince': 'hotel-u-prince',
  'ice-arena-katerinky': 'ice-arena-katerinky',
  'ice-arena-letnany': 'ice-arena-letnany',
  'kavarna-co-hleda-jmeno': 'kavarna-co-hleda-jmeno',
  'kino-pilotu': 'kino-pilotu',
  'klubovna-2-patro': '2-patro-take-klubovna-2-patro',
  'ku-club-bar': 'ku-club-bar',
  'kulinarni-studio-mafra': 'kulinarni-studio-mafra',
  'la-bottega-oaks-deli-bistro': 'oaks-prague-la-bottega',
  'milano-meeting-room': 'space-cafe-hub-karlin-milano',
  'moonclub': 'moon-club-lounge',
  'narozeninova-oslava-s-dinosaury': 'dinosauria-birthday',
  'noc-v-muzeu': 'dinosauria-noc-v-muzeu',
  'nod': 'divadlo-nod-cafe-nod',
  'oaks-prague': 'oaks-prague',
  'ox-prague-club': 'ox-club-prague',
  'paris-meeting-room': 'space-cafe-hub-karlin-paris',
  'party-boxy-v-o2-arene-hc-sparta-praha': 'party-boxy-o2-arena',
  'corso-revnice': 'corso-revnice',
  'pivnice-polepsovna': 'pivnice-polepsovna',
  'poznavani-s-paleontologem': 'dinosauria-poznavani-s-paleontologem',
  'prague-city-golf-rohan': 'prague-city-golf-rohan',
  'prague-city-golf-zbraslav': 'prague-city-golf-zbraslav',
  'prague-podcast-studio': 'space-cafe-hub-karlin-podcast',
  'prime-house-karlin': 'prime-house-karlin',
  'pytloun-old-armoury-hotel-prague': 'pytloun-old-armoury-hotel-prague',
  'pytloun-sky-bar-restaurant-prague': 'pytloun-sky-bar-restaurant',
  'radlicka-kulturni-sportovna': 'radlicka-kulturni-sportovna',
  'restaurace-gutovka-areal-gutovka': 'restaurace-gutovka',
  'revolution-train': 'revolution-train',
  'restaurant-parnas': 'restaurant-parnas',
  'salabka-restaurace-vinarstvi-v-praze': 'salabka-restaurace-vinarstvi',
  'skoda-muzeum-mlada-boleslav': 'skoda-muzeum-mlada-boleslav',
  'space-cafe-hub-karlin': 'space-cafe-hub-karlin',
  'strecha-radost': 'strecha-radost',
  'teambuilding-ve-virtualni-realite': 'dinosauria-teambuilding-vr',
  'tovarna-vir': 'tovarna-vir',
  'stara-cistirna': 'stara-cistirna',
  'stara-cistirna-galerie': 'stara-cistirna-galerie',
  'stara-cistirna-hlavni-hala': 'stara-cistirna-hlavni-hala',
  'stara-cistirna-puda': 'stara-cistirna-puda',
  'stara-cistirna-strojovna-a-kotelna': 'stara-cistirna-strojovna-a-kotelna',
  'stara-cistirna-sloupovy-sal': 'stara-cistirna-sloupovy-sal',
  'stara-cistirna-sal-kalovych-cerpadel': 'stara-cistirna-sal-kalovych-cerpadel',
  'stara-cistirna-sal-lapace-pisku': 'stara-cistirna-sal-lapace-pisku',
  'stara-cistirna-puda-nad-kavarnou': 'stara-cistirna-puda-nad-kavarnou',
  'turquoise-prague': 'turquoise-prague',
  'turquoise-prague-restaurant': 'turquoise-prague-restaurant',
  'turquoise-prague-sal-v-muzeu': 'turquoise-prague-sal-v-muzeu',
  'turquoise-prague-zahrada': 'turquoise-prague-zahrada',
  'the-monkey-bar-prague': 'monkey-bar-prague',
  'the-original-beer-experience-prague': 'pilsner-urquell-the-original-beer-experience',
  'the-pop-up': 'the-pop-up',
  'vzdelavaci-program-pro-skoly': 'dinosauria-vzdelavaci-program',
  'areal-7': 'areal-7',
  'muzeum-slivovice-r-jelinek': 'muzeum-slivovice-r-jelinek',
  'muzeum-slivovice-r-jelinek-bar-a-klub': 'muzeum-slivovice-r-jelinek-bar-a-klub',
  'muzeum-slivovice-r-jelinek-ochutnavkova-cast': 'muzeum-slivovice-r-jelinek-ochutnavkova-cast',
  'muzeum-slivovice-r-jelinek-salonek-kampa': 'muzeum-slivovice-r-jelinek-salonek-kampa',
  'muzeum-slivovice-r-jelinek-salonek-u-jelinka': 'muzeum-slivovice-r-jelinek-salonek-u-jelinka',
  'muzeum-slivovice-r-jelinek-salonek-vizovice': 'muzeum-slivovice-r-jelinek-salonek-vizovice',
  'muzeum-slivovice-r-jelinek-venkovni-prostor': 'muzeum-slivovice-r-jelinek-venkovni-prostor',
  'laurin-klement-forum': 'skoda-muzeum-mlada-boleslav-laurin-klement-forum',
  'hieronimus-i': 'skoda-muzeum-mlada-boleslav-hieronimus-i',
  'mistnost-393': 'mistnost-393',
  // New meatspace venues
  'kaunicky-palac': 'kaunicky-palac',
  'academy-hub-karlovy-vary': 'academy-hub-karlovy-vary',
  'alforno-pizza-pasta': 'alforno-pizza-pasta',
  'demanova-rezort': 'demanova-rezort',
  'aparthotel-na-klenici': 'aparthotel-na-klenici',
  'stodola-unetickeho-pivovaru': 'stodola-unetickeho-pivovaru',
  'mala-sin-galerie-manes': 'mala-sin-galerie-manes',
  'sporthotel-slavia': 'sporthotel-slavia',
  'll-gallery': 'll-gallery',
  'majaland-praha': 'majaland-praha',
  'majaland-praha-firemni-akce': 'majaland-praha-firemni-akce',
  'majaland-praha-family-day': 'majaland-praha-family-day',
  'majaland-praha-pronajem-cely': 'majaland-praha-pronajem-cely',
  'narozeninova-oslava-s-vcelkou-majou': 'majaland-praha-narozeninova-oslava',
  'pop-airport': 'pop-airport',
  'pop-outlet': 'pop-airport-pop-outlet',
  'pop-private-shopping': 'pop-airport-pop-private-shopping',
  'specialni-eventy-na-klic': 'pop-airport-specialni-eventy-na-klic',
  'venkovni-prostory': 'pop-airport-venkovni-prostory',
  'parkoviste': 'pop-airport-parkoviste',
  'pop-night-shopping-partner': 'pop-airport-pop-night-shopping-partner',
  'firemni-workshop-se-stylistkou': 'pop-airport-firemni-workshop-se-stylistkou',
  'vip-lounge': 'pop-airport-vip-lounge',
  'dancing-house-hotel': 'dancing-house-hotel',
  'restaurace-ginger-fred': 'dancing-house-hotel-restaurace-ginger-fred',
  'dancing-house-cafe': 'dancing-house-hotel-dancing-house-cafe',
  'zasedaci-mistnost': 'dancing-house-hotel-zasedaci-mistnost',
  'meeting-room': 'dancing-house-hotel-meeting-room',
  'chateau-st-havel': 'chateau-st-havel',
  'zamecky-sal': 'chateau-st-havel-zamecky-sal',
  'venkovni-stan': 'chateau-st-havel-venkovni-stan',
  'restaurace-chateau-st-havel': 'chateau-st-havel-restaurace',
  'kaple-sv-havla': 'chateau-st-havel-kaple-sv-havla',
  'salonek-i-salonek-ii': 'chateau-st-havel-salonek-i-salonek-ii',
  'zamecky-park': 'chateau-st-havel-zamecky-park',
  'golf': 'chateau-st-havel-golf',
  'wellness': 'chateau-st-havel-wellness',
  // New meatspace venues batch 2
  'narodni-21': 'narodni-21',
  'automat-aviatica': 'automat-aviatica',
  'turnovska-pivnice-vrsovice': 'turnovska-pivnice-vrsovice',
  'turnovska-pivnice-churchill': 'turnovska-pivnice-churchill',
  'turnovska-pivnice-waltrovka': 'turnovska-pivnice-waltrovka',
  'turnovska-pivnice-brumlovka': 'turnovska-pivnice-brumlovka',
  'iyengar-yoga-institut-praha': 'iyengar-yoga-institut-praha',
  '2-deci-komorni-prostor-pro-akce': '2-deci-komorni-prostor-pro-akce',
  '2-deci-vinohrady': '2-deci-vinohrady',
  'kulickario': 'kulickario',
  'chalupa-nonnetit': 'chalupa-nonnetit',
  'little-italy': 'little-italy',
  'fabrika-hotel': 'fabrika-hotel',
  'atma-community-space': 'atma-community-space',
  'falkensteiner-hotel-prague': 'falkensteiner-hotel-prague',
  'ponton-bratislava': 'ponton-bratislava',
  'mozart-interactive-museum': 'mozart-interactive-museum',
  'jezero.ooo': 'jezero-ooo',
  'centrum-jason': 'centrum-jason',
  'sal': 'centrum-jason-sal',
  'cvicebna': 'centrum-jason-cvicebna',
  'atelier': 'centrum-jason-atelier',
  'oaza-lahovicky': 'oaza-lahovicky',
  'vila-kajetanka': 'vila-kajetanka',
  'salonky': 'vila-kajetanka-salonky',
  'narodni-dum-na-vinohradech': 'narodni-dum-na-vinohradech',
  'majakovskeho-sal': 'narodni-dum-na-vinohradech-majakovskeho-sal',
  'raisuv-sal': 'narodni-dum-na-vinohradech-raisuv-sal',
  'automaticke-mlyny': 'automaticke-mlyny',
  'amfiteatr': 'automaticke-mlyny-amfiteatr',
  'vzlet': 'vzlet',
  'hub-na-poli': 'hub-na-poli',
  'prague-city-golf-vinor': 'prague-city-golf-vinor',
  'konferencni-centrum-krocinova': 'konferencni-centrum-krocinova',
  'petrohradska-galerie': 'petrohradska-galerie',
  'petrohradska-kino': 'petrohradska-kino',
  'zasedame_cz': 'zasedame',
  'zasedame_cz-velka-mistnost-pro-akce': 'zasedame-velka-mistnost-pro-akce',
  'fat-cat-bubbles-bar': 'fat-cat-bubbles-bar',
  'fat-cat-underground': 'fat-cat-underground',
  'zamek-lisno': 'zamek-lisno',
  'hotel-jezerka': 'hotel-jezerka',
  'grand-hotel-international-prague': 'grand-hotel-international-prague',
  'the-factory-loft-prague': 'the-factory-loft-prague',
  'stodola-suska': 'stodola-suska',
  'zero-latency-prague': 'zero-latency-prague',
  'sumo-garden': 'sumo-garden',
  'molo-lipno': 'molo-lipno',
  'golf-resort-black-bridge': 'golf-resort-black-bridge',
  'a-la-petite-eiffel': 'a-la-petite-eiffel',
  'balbi-bar': 'balbi-bar',
  'bar-behind-the-curtain': 'bar-behind-the-curtain',
  'bar-kobka-8': 'bar-kobka-8',
  'barley-pub-gallery': 'barley-pub-gallery',
  'beltine-forest-hotel': 'beltine-forest-hotel',
  'aqualand-inn': 'aqualand-inn',
  'autentista-wine-champagne-bar': 'autentista-wine-champagne-bar',
  'bistro-na-chlebu': 'bistro-na-chlebu',
  'centrum-horec': 'centrum-horec',
  'chata-hradecanka': 'chata-hradecanka',
  'chata-na-seraku': 'chata-na-seraku',
  'crowd-cafe': 'crowd-cafe',
  'dejavu-music-bar-prague': 'dejavu-music-bar-prague',
  'dergi-lounge': 'dergi-lounge',
  'foyer-cafe': 'foyer-cafe',
  'garbe-holesovice': 'garbe-holesovice',
  'green-table': 'green-table',
  'hotel-medlov': 'hotel-medlov',
  'hotel-praded-thamm': 'hotel-praded-thamm',
  'hotel-skanzen': 'hotel-skanzen',
  'hrad-strekov': 'hrad-strekov',
  'permonium': 'permonium',
  'vila-barrandov': 'vila-barrandov',
  'woowoo-studio': 'woowoo-studio',
  'zamek-decin': 'zamek-decin',
  'zamek-slavkov-austerlitz': 'zamek-slavkov-austerlitz',
  'zamecky-hotel-valtice': 'zamecky-hotel-valtice',
  'boardroom': 'falkensteiner-hotel-prague-boardroom'
}

const slugToFolderMap = Object.fromEntries(
  Object.entries(folderToSlugMap).map(([folder, slug]) => [slug, folder])
)

const EXTENSION_CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

async function ensureBucketExists(bucketName) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    throw new Error(`Unable to list storage buckets: ${listError.message}`)
  }

  const exists = buckets?.some((bucket) => bucket.name === bucketName)
  if (exists) {
    return
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: Object.values(EXTENSION_CONTENT_TYPES),
  })

  if (createError) {
    throw new Error(`Failed to create bucket "${bucketName}": ${createError.message}`)
  }

  console.log(`🪣 Created storage bucket "${bucketName}".`)
}

function getContentType(fileName) {
  const ext = path.extname(fileName).replace('.', '').toLowerCase()
  return EXTENSION_CONTENT_TYPES[ext] || 'application/octet-stream'
}

async function getFolders() {
  const entries = await fs.readdir(IMAGE_ROOT, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

async function uploadFolderImages(folderName, slug) {
  const folderPath = path.join(IMAGE_ROOT, folderName)
  const venue = await prisma.venue.findUnique({ where: { slug } })

  if (!venue) {
    console.warn(`⚠️  Venue with slug "${slug}" not found. Skipping folder "${folderName}".`)
    return { slug, skipped: true }
  }

  const fileEntries = await fs.readdir(folderPath, { withFileTypes: true })
  const files = fileEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  if (files.length === 0) {
    console.warn(`⚠️  No image files found in folder "${folderName}".`)
    return { slug, skipped: true }
  }

  let selectedFiles = files
  const uploadedUrls = []

  if (files.length > MAX_IMAGES_PER_VENUE) {
    const extraFiles = files.slice(MAX_IMAGES_PER_VENUE)
    selectedFiles = files.slice(0, MAX_IMAGES_PER_VENUE)

    if (extraFiles.length > 0) {
      const removalPaths = extraFiles.map((fileName) => `venue-images/${slug}/${fileName}`)

      const { error: removeError } = await supabase.storage
        .from('venues')
        .remove(removalPaths)

      if (removeError && removeError.message !== 'Some items could not be found') {
        console.warn(`⚠️  Failed to remove some existing images for ${slug}: ${removeError.message}`)
      }

      for (const extraFile of extraFiles) {
        const extraPath = path.join(folderPath, extraFile)
        try {
          await fs.unlink(extraPath)
        } catch (unlinkError) {
          console.warn(`⚠️  Unable to delete extra image ${extraFile} in "${folderName}": ${unlinkError.message}`)
        }
      }

      console.log(`ℹ️  Trimmed ${extraFiles.length} images in "${folderName}" to keep the first ${MAX_IMAGES_PER_VENUE}.`)
    }
  }

  for (const fileName of selectedFiles) {
    const filePath = path.join(folderPath, fileName)
    const fileBuffer = await fs.readFile(filePath)
    const contentType = getContentType(fileName)
    const storagePath = `venue-images/${slug}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('venues')
      .upload(storagePath, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload ${fileName} for ${slug}: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('venues').getPublicUrl(storagePath)

    uploadedUrls.push(publicUrl)
  }

  await prisma.venue.update({
    where: { slug },
    data: { images: uploadedUrls },
  })

  console.log(`✅ Updated venue ${slug} with ${uploadedUrls.length} images.`)
  return { slug, count: uploadedUrls.length }
}

async function main() {
  console.log('📸 Uploading venue images to Supabase storage...')
  console.log(`Using database: ${DATABASE_URL.replace(/:[^:@/]*@/, '://***:***@')}`)

  await ensureBucketExists('venues')

  let folders
  const requestedInputs = process.argv.slice(2)

  if (requestedInputs.length > 0) {
    const selectedFolders = new Set()

    for (const input of requestedInputs) {
      let folderName = null

      if (Object.prototype.hasOwnProperty.call(folderToSlugMap, input)) {
        folderName = input
      } else if (Object.prototype.hasOwnProperty.call(slugToFolderMap, input)) {
        folderName = slugToFolderMap[input]
      }

      if (!folderName) {
        console.warn(`⚠️  No matching folder mapping found for "${input}". Skipping.`)
        continue
      }

      selectedFolders.add(folderName)
    }

    if (selectedFolders.size === 0) {
      console.warn('⚠️  No valid folders provided. Nothing to upload.')
      await prisma.$disconnect()
      return
    }

    folders = Array.from(selectedFolders)
  } else {
    folders = await getFolders()
  }
  const results = []

  for (const folderName of folders) {
    const slug = folderToSlugMap[folderName]
    if (!slug) {
      console.warn(`⚠️  No slug mapping found for folder "${folderName}". Skipping.`)
      continue
    }

    try {
      const result = await uploadFolderImages(folderName, slug)
      results.push(result)
    } catch (error) {
      console.error(`❌ Error processing folder "${folderName}":`, error)
    }
  }

  const uploaded = results.filter((result) => !result?.skipped)
  console.log(`\n🎉 Completed. Updated ${uploaded.length} venues with new images.`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  prisma.$disconnect().finally(() => process.exit(1))
})
