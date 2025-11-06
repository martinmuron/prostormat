// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Resend } from 'resend'
import { generateVenueSubmissionConfirmationEmail } from '../src/lib/email-templates'

async function sendTestConfirmationEmail() {
  console.log('🚀 Sending test confirmation email...')

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
    const emailContent = generateVenueSubmissionConfirmationEmail({
      contactName: 'Martin',
      locationTitle: 'Testovací Prostor',
      submissionType: 'claim', // Changed to 'claim' to test venue claiming
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
    console.log('\n✨ Check your inbox!')
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

sendTestConfirmationEmail()
