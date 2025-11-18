// Load environment variables FIRST
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const emailAddresses = [
  'blasko.anna@gmail.com',
  'recepce@opero.cz',
  'tereza.vydrova@expandiahotels.com',
  'info@hoaxpub.cz',
  'zdenek@healthylongevity.cafe',
  'kristyna@iy.yoga',
  'michaela@vzlet.cz',
  'info@muzeumslivovice.cz',
]

async function checkSubmissions() {
  console.log('🔍 Checking venue submissions...\n')

  try {
    const submissions = await prisma.venueSubmissionRequest.findMany({
      where: {
        contactEmail: {
          in: emailAddresses,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${submissions.length} submissions:\n`)

    for (const submission of submissions) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:', submission.contactEmail)
      console.log('👤 Name:', submission.contactName)
      console.log('🏢 Venue:', submission.locationTitle || 'N/A')
      console.log('📝 Type:', submission.submissionType)
      console.log('📅 Created:', submission.createdAt)
      console.log('🆔 Existing Venue ID:', submission.existingVenueId || 'N/A')
      console.log('')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n✅ Total submissions found: ${submissions.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubmissions()
