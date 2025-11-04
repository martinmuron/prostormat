import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load production environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.production') })

const prisma = new PrismaClient()

async function investigateVenue() {
  const venueId = 'fe51ccf1-a869-43b8-836b-2f1ccab858b6'

  console.log('🔍 Investigating venue:', venueId)
  console.log('═'.repeat(80))

  try {
    // Get venue details
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        managerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!venue) {
      console.log('❌ Venue not found!')
      return
    }

    console.log('\n📍 VENUE DETAILS:')
    console.log('Name:', venue.name)
    console.log('Slug:', venue.slug)
    console.log('Address:', venue.address)
    console.log('Status:', venue.status)
    console.log('Manager ID:', venue.managerId || '(none)')
    console.log('Created:', venue.createdAt)
    console.log('Updated:', venue.updatedAt)

    // If venue has a managerId, check the user
    if (venue.managerId) {
      console.log('\n👤 CHECKING MANAGER USER...')
      console.log('─'.repeat(80))

      const manager = await prisma.user.findUnique({
        where: { id: venue.managerId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        }
      })

      if (!manager) {
        console.log('❌ PROBLEM FOUND: Manager user does NOT exist in database!')
        console.log('   The venue has managerId:', venue.managerId)
        console.log('   But no user with this ID exists.')
        console.log('\n💡 SOLUTION: Set managerId to NULL for this venue')
      } else {
        console.log('✅ Manager user found:')
        console.log('   Email:', manager.email)
        console.log('   Name:', manager.name || '(not set)')
        console.log('   Role:', manager.role)
        console.log('   Email Verified:', manager.emailVerified ? 'Yes' : 'No')
        console.log('   Created:', manager.createdAt)

        if (manager.role !== 'venue_manager') {
          console.log('\n❌ PROBLEM FOUND: Manager user role is NOT "venue_manager"!')
          console.log('   Expected: venue_manager')
          console.log('   Actual:', manager.role)
          console.log('\n💡 SOLUTIONS:')
          console.log('   1. Change user role to "venue_manager"')
          console.log('   2. Set venue managerId to NULL')
        } else {
          console.log('\n✅ Manager configuration looks correct!')
        }
      }
    } else {
      console.log('\n✅ Venue has no manager assigned (managerId is NULL)')
    }

    // Check admin user for reference
    console.log('\n👑 CHECKING ADMIN USER...')
    console.log('─'.repeat(80))
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@prostormat.cz' },
      select: {
        id: true,
        email: true,
        role: true,
      }
    })

    if (admin) {
      console.log('✅ Admin user found:')
      console.log('   ID:', admin.id)
      console.log('   Email:', admin.email)
      console.log('   Role:', admin.role)
    } else {
      console.log('❌ Admin user not found!')
    }

    console.log('\n' + '═'.repeat(80))
    console.log('🏁 Investigation complete')

  } catch (error) {
    console.error('❌ Error during investigation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

investigateVenue()
