// Load environment variables FIRST
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import { generateVenueSubmissionConfirmationEmail } from '../src/lib/email-templates'

// Use non-pooling connection for scripts (supports prepared statements)
const sessionUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: sessionUrl,
    },
  },
})

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

async function sendConfirmationEmails() {
  console.log('📧 Sending confirmation emails...\n')

  // Create Resend client
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is required')
  }

  const resend = new Resend(resendApiKey)
  const FROM_EMAIL = 'Prostormat <info@prostormat.cz>'

  try {
    // Get all submissions for these emails
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

    // Group by email and take the most recent submission
    const submissionsByEmail = new Map()
    for (const submission of submissions) {
      if (!submissionsByEmail.has(submission.contactEmail)) {
        submissionsByEmail.set(submission.contactEmail, submission)
      }
    }

    console.log(`Found ${submissionsByEmail.size} unique emails to process\n`)

    let sentCount = 0
    let failedCount = 0

    for (const [email, submission] of submissionsByEmail) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Sending to:', email)
      console.log('👤 Name:', submission.contactName)
      console.log('🏢 Venue:', submission.locationTitle)
      console.log('📝 Type:', submission.submissionType === 'claim' ? 'převzetí' : 'přidání')

      try {
        const emailContent = generateVenueSubmissionConfirmationEmail({
          contactName: submission.contactName,
          locationTitle: submission.locationTitle || undefined,
          submissionType: submission.submissionType as 'new' | 'claim' | 'priority_interest',
        })

        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })

        console.log('✅ Sent! Email ID:', result.data?.id)
        sentCount++
      } catch (error) {
        console.error('❌ Failed to send:', error)
        failedCount++
      }

      console.log('')

      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📊 Summary:`)
    console.log(`✅ Sent: ${sentCount}`)
    console.log(`❌ Failed: ${failedCount}`)
    console.log(`📬 Total: ${submissionsByEmail.size}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

sendConfirmationEmails()
