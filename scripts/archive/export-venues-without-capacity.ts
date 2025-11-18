import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Use DATABASE_URL directly - it should already have correct parameters
const prisma = new PrismaClient()

async function exportVenuesWithoutCapacity() {
  console.log('🔍 Searching for venues without capacity data...\n')

  try {
    // Query venues without capacity
    const venues = await prisma.venue.findMany({
      where: {
        status: 'published',
        OR: [
          {
            AND: [
              { capacitySeated: null },
              { capacityStanding: null }
            ]
          },
          {
            AND: [
              { OR: [{ capacitySeated: null }, { capacitySeated: 0 }] },
              { OR: [{ capacityStanding: null }, { capacityStanding: 0 }] }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        district: true,
        address: true,
        status: true,
        capacitySeated: true,
        capacityStanding: true,
        contactEmail: true,
        contactPhone: true,
        websiteUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${venues.length} venues without capacity data\n`)

    // Generate CSV content
    const csvHeader = 'ID,Name,District,Address,Status,Capacity Seated,Capacity Standing,Contact Email,Contact Phone,Website,Created At\n'
    const csvRows = venues.map(v => {
      const escapeCsvField = (field: any) => {
        if (field === null || field === undefined) return ''
        const str = String(field)
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      return [
        escapeCsvField(v.id),
        escapeCsvField(v.name),
        escapeCsvField(v.district),
        escapeCsvField(v.address),
        escapeCsvField(v.status),
        escapeCsvField(v.capacitySeated),
        escapeCsvField(v.capacityStanding),
        escapeCsvField(v.contactEmail),
        escapeCsvField(v.contactPhone),
        escapeCsvField(v.website),
        escapeCsvField(v.createdAt?.toISOString())
      ].join(',')
    }).join('\n')

    const csvContent = csvHeader + csvRows

    // Write to file
    const outputPath = join(process.cwd(), 'venues_without_capacity.csv')
    writeFileSync(outputPath, csvContent, 'utf-8')

    console.log(`📝 Exported to: ${outputPath}\n`)

    // Also create a JSON version for easier processing
    const jsonOutputPath = join(process.cwd(), 'venues_without_capacity.json')
    writeFileSync(jsonOutputPath, JSON.stringify(venues, null, 2), 'utf-8')

    console.log(`📝 JSON version: ${jsonOutputPath}\n`)

    // Print summary
    console.log('📊 Summary:')
    console.log(`   Total venues: ${venues.length}`)
    console.log(`   With contact email: ${venues.filter(v => v.contactEmail).length}`)
    console.log(`   With contact phone: ${venues.filter(v => v.contactPhone).length}`)
    console.log(`   With website: ${venues.filter(v => v.websiteUrl).length}`)
    console.log('\n✅ Export complete!\n')

    // Print first 5 as examples
    console.log('📋 First 5 venues:')
    venues.slice(0, 5).forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name} (${v.district || 'No district'})`)
      console.log(`      ID: ${v.id}`)
      console.log(`      Contact: ${v.contactEmail || 'No email'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportVenuesWithoutCapacity()
