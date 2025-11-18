// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Resend } from 'resend'
import { generateQuickRequestVenueNotificationEmail } from '../src/lib/email-templates'

async function sendTestQuickRequestEmail() {
  console.log('🚀 Sending test quick request email...')

  // Create Resend client after env is loaded
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is not set in .env.local')
    throw new Error('RESEND_API_KEY is required')
  }

  console.log('✓ API Key loaded:', resendApiKey.substring(0, 10) + '...')

  const resend = new Resend(resendApiKey)
  const FROM_EMAIL = 'Prostormat <info@prostormat.cz>'

  try {
    const emailContent = generateQuickRequestVenueNotificationEmail({
      venueName: 'Testovací Prostor Praha',
      venueSlug: 'testovaci-prostor-praha',
      broadcastId: 'test-broadcast-123',
      quickRequest: {
        title: 'Firemní vánoční večírek 2025',
        guestCount: 150,
        eventDate: new Date('2025-12-15'),
        locationPreference: 'Praha 1',
      },
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: 'mark.muron@gmail.com',
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    console.log('✅ Email sent successfully!')
    console.log('📧 Email ID:', result.data?.id)
    console.log('📬 Sent to: mark.muron@gmail.com')
    console.log('📝 Subject:', emailContent.subject)
    console.log('\n✨ Check your inbox on mobile!')
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

sendTestQuickRequestEmail()
