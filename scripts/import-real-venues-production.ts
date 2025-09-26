import { PrismaClient } from '@prisma/client'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL
    }
  }
})

interface VenueData {
  name: string
  slug: string
  description: string
  address: string
  capacitySeated: string
  capacityStanding: string
  venueType: string
  amenities: string[]
  contactEmail: string
  contactPhone: string
  websiteUrl?: string
  images: string[]
  operatingHours?: string
  nearestTransport?: string
  neighborhood?: string
  specialFeatures?: string
  district?: string
}

function normalizeEmail(value: string): string {
  const cleaned = value.split(/[\/,;]/)[0]?.trim() ?? ''
  return cleaned.toLowerCase()
}

async function readVenueFile(filePath: string): Promise<string> {
  if (filePath.toLowerCase().endsWith('.docx')) {
    const { default: mammoth } = await import('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }

  return readFileSync(filePath, 'utf-8')
}

function removeDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .normalize('NFC')
}

function createSlug(name: string): string {
  return removeDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractVenueInfo(content: string): VenueData {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const data: Partial<VenueData> = {}
  
  // Extract basic info
  const nameMatch = lines.find(line => line.startsWith('Name:'))
  data.name = nameMatch ? nameMatch.replace('Name:', '').trim() : ''
  
  const descMatch = lines.find(line => line.startsWith('Description:'))
  data.description = descMatch ? descMatch.replace('Description:', '').trim() : ''
  
  const addressMatch = lines.find(line => line.startsWith('Full address:'))
  data.address = addressMatch ? addressMatch.replace('Full address:', '').trim() : ''
  
  // Extract capacity
  const seatedMatch = lines.find(line => line.startsWith('Seated capacity:'))
  let seatedCapacity = seatedMatch ? seatedMatch.replace('Seated capacity:', '').trim() : ''
  // Extract numbers from capacity strings
  const seatedNumbers = seatedCapacity.match(/\d+/)
  data.capacitySeated = seatedNumbers ? seatedNumbers[0] : ''
  
  const standingMatch = lines.find(line => line.startsWith('Standing capacity:'))
  let standingCapacity = standingMatch ? standingMatch.replace('Standing capacity:', '').trim() : ''
  const standingNumbers = standingCapacity.match(/\d+/)
  data.capacityStanding = standingNumbers ? standingNumbers[0] : ''
  
  // Extract venue type
  const typeMatch = lines.find(line => line.startsWith('Venue type:'))
  let venueType = typeMatch ? typeMatch.replace('Venue type:', '').trim() : ''
  // Map to our venue types
  if (venueType.toLowerCase().includes('hotel')) {
    data.venueType = 'hotel'
  } else if (venueType.toLowerCase().includes('rooftop') || venueType.toLowerCase().includes('střešní')) {
    data.venueType = 'rooftop'
  } else if (venueType.toLowerCase().includes('pub')) {
    data.venueType = 'pub'
  } else if (venueType.toLowerCase().includes('restaurant')) {
    data.venueType = 'restaurant'
  } else if (venueType.toLowerCase().includes('bar')) {
    data.venueType = 'bar'
  } else if (venueType.toLowerCase().includes('club')) {
    data.venueType = 'club'
  } else if (venueType.toLowerCase().includes('galerie') || venueType.toLowerCase().includes('gallery')) {
    data.venueType = 'gallery'
  } else if (venueType.toLowerCase().includes('kino') || venueType.toLowerCase().includes('cinema')) {
    data.venueType = 'cinema'
  } else {
    data.venueType = 'event_space'
  }
  
  // Extract contact info
  const emailMatch = lines.find(line => line.startsWith('Email:'))
  data.contactEmail = emailMatch ? normalizeEmail(emailMatch.replace('Email:', '').trim()) : ''
  
  const phoneMatch = lines.find(line => line.startsWith('Phone:'))
  data.contactPhone = phoneMatch ? phoneMatch.replace('Phone:', '').trim() : ''
  
  const websiteMatch = lines.find(line => line.startsWith('Website:'))
  data.websiteUrl = websiteMatch ? websiteMatch.replace('Website:', '').trim() : undefined

  const districtMatch = lines.find(line => line.startsWith('Prague district:'))
  data.district = districtMatch ? districtMatch.replace('Prague district:', '').trim() : undefined
  
  // Extract amenities from the amenities line and description
  const amenitiesMatch = lines.find(line => line.startsWith('Amenities:'))
  let amenitiesText = amenitiesMatch ? amenitiesMatch.replace('Amenities:', '').trim() : ''
  
  // Parse amenities from text
  const amenities: string[] = []
  if (amenitiesText.includes('bar') || venueType.toLowerCase().includes('bar')) amenities.push('Bar')
  if (amenitiesText.includes('terasa') || amenitiesText.includes('rooftop') || amenitiesText.includes('střešní')) amenities.push('Terasa')
  if (amenitiesText.includes('zahrad') || amenitiesText.includes('garden')) amenities.push('Zahrada')
  if (amenitiesText.includes('parking') || amenitiesText.includes('garáže')) amenities.push('Parking')
  if (amenitiesText.includes('wifi') || amenitiesText.includes('internet')) amenities.push('WiFi')
  if (amenitiesText.includes('klimat') || amenitiesText.includes('air')) amenities.push('Klimatizace')
  if (amenitiesText.includes('projektor') || amenitiesText.includes('projector')) amenities.push('Projektor')
  if (amenitiesText.includes('ozvučení') || amenitiesText.includes('audio') || amenitiesText.includes('sound')) amenities.push('Ozvučení')
  if (amenitiesText.includes('kuchyně') || amenitiesText.includes('kitchen') || amenitiesText.includes('catering')) amenities.push('Catering možnosti')
  if (amenitiesText.includes('bezbariér') || amenitiesText.includes('accessible')) amenities.push('Bezbariérový přístup')
  if (amenitiesText.includes('galerie') || amenitiesText.includes('gallery')) amenities.push('Galerie')
  if (amenitiesText.includes('výhled') || amenitiesText.includes('view')) amenities.push('Výhled')
  
  data.amenities = amenities.length > 0 ? amenities : ['Nekuřácký prostor']
  
  // Extract operating hours
  const hoursMatch = lines.find(line => line.startsWith('Operating hours:'))
  data.operatingHours = hoursMatch ? hoursMatch.replace('Operating hours:', '').trim() : undefined
  
  // Extract transport info
  const transportMatch = lines.find(line => line.startsWith('Nearest metro/public transport:'))
  data.nearestTransport = transportMatch ? transportMatch.replace('Nearest metro/public transport:', '').trim() : undefined
  
  // Extract neighborhood
  const neighborhoodMatch = lines.find(line => line.startsWith('Neighborhood:'))
  data.neighborhood = neighborhoodMatch ? neighborhoodMatch.replace('Neighborhood:', '').trim() : undefined
  
  // Extract unique features
  const featuresMatch = lines.find(line => line.startsWith('Unique location features:'))
  data.specialFeatures = featuresMatch ? featuresMatch.replace('Unique location features:', '').trim() : undefined
  
  // Create slug
  data.slug = createSlug(data.name!)
  
  // Add placeholder images (we'll need real ones later)
  data.images = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ]
  
  return data as VenueData
}

async function main() {
  console.log('Starting real venue import to PRODUCTION...')
  console.log('Database URL:', process.env.DATABASE_URL_PRODUCTION ? 'Production (Supabase)' : 'Local Development')
  
  // Get the venue manager user
  let venueManager = await prisma.user.findFirst({
    where: { role: 'venue_manager' }
  })
  
  if (!venueManager) {
    console.log('Creating venue manager...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('venues123', 12)
    
    venueManager = await prisma.user.create({
      data: {
        email: 'venues@prostormat.cz',
        name: 'Venue Manager',
        password: hashedPassword,
        role: 'venue_manager',
        phone: '+420 777 123 456',
        createdAt: new Date(),
      }
    })
  }
  
  // Read all venue text files
  const prostoryDir = join(process.cwd(), 'prostory')
  const venueFiles = readdirSync(prostoryDir).filter(file => file.endsWith('.txt') || file.endsWith('.docx'))
  
  console.log(`Found ${venueFiles.length} venue files to process`)
  
  let synced = 0
  let skipped = 0
  
  for (const file of venueFiles) {
    try {
      const filePath = join(prostoryDir, file)
      const content = await readVenueFile(filePath)
      const venueData = extractVenueInfo(content)
      
      if (!venueData.name || !venueData.address) {
        console.log(`Skipping ${file} - missing required data`)
        skipped++
        continue
      }
      
      await prisma.venue.upsert({
        where: { slug: venueData.slug },
        update: {
          name: venueData.name,
          description: venueData.description,
          address: venueData.address,
          district: venueData.district || null,
          capacitySeated: venueData.capacitySeated ? parseInt(venueData.capacitySeated, 10) : null,
          capacityStanding: venueData.capacityStanding ? parseInt(venueData.capacityStanding, 10) : null,
          venueType: venueData.venueType,
          amenities: venueData.amenities,
          contactEmail: venueData.contactEmail,
          contactPhone: venueData.contactPhone,
          websiteUrl: venueData.websiteUrl,
          images: venueData.images,
          status: 'active',
          managerId: venueManager.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
        create: {
          id: randomUUID(),
          name: venueData.name,
          slug: venueData.slug,
          description: venueData.description,
          address: venueData.address,
          district: venueData.district || null,
          capacitySeated: venueData.capacitySeated ? parseInt(venueData.capacitySeated, 10) : null,
          capacityStanding: venueData.capacityStanding ? parseInt(venueData.capacityStanding, 10) : null,
          venueType: venueData.venueType,
          amenities: venueData.amenities,
          contactEmail: venueData.contactEmail,
          contactPhone: venueData.contactPhone,
          websiteUrl: venueData.websiteUrl,
          images: venueData.images,
          status: 'active',
          managerId: venueManager.id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      console.log(`✅ Synced: ${venueData.name}`)
      synced++
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
      skipped++
    }
  }
  
  console.log(`\n🎉 Production import completed!`)
  console.log(`   Synced: ${synced} venues`)
  console.log(`   Skipped: ${skipped} venues`)
}

main()
  .catch((error) => {
    console.error('Production import failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
