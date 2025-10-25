#!/usr/bin/env tsx

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const resendModulePromise = import('../src/lib/resend')
const emailTemplatesModulePromise = import('../src/lib/email-templates')

let resendClient: typeof import('../src/lib/resend')['resend']
let FROM_EMAIL: typeof import('../src/lib/resend')['FROM_EMAIL']
let REPLY_TO_EMAIL: typeof import('../src/lib/resend')['REPLY_TO_EMAIL']

let generateVenueBroadcastEmail: typeof import('../src/lib/email-templates')['generateVenueBroadcastEmail']
let generatePasswordResetEmail: typeof import('../src/lib/email-templates')['generatePasswordResetEmail']
let generateWelcomeEmailForUser: typeof import('../src/lib/email-templates')['generateWelcomeEmailForUser']
let generateWelcomeEmailForLocationOwner: typeof import('../src/lib/email-templates')['generateWelcomeEmailForLocationOwner']
let generateContactFormThankYouEmail: typeof import('../src/lib/email-templates')['generateContactFormThankYouEmail']
let generateOrganizeEventThankYouEmail: typeof import('../src/lib/email-templates')['generateOrganizeEventThankYouEmail']
let generateAddVenueThankYouEmail: typeof import('../src/lib/email-templates')['generateAddVenueThankYouEmail']
let generateQuickRequestVenueNotificationEmail: typeof import('../src/lib/email-templates')['generateQuickRequestVenueNotificationEmail']

async function loadEmailModules() {
  const resendModule = await resendModulePromise
  resendClient = resendModule.resend
  FROM_EMAIL = resendModule.FROM_EMAIL
  REPLY_TO_EMAIL = resendModule.REPLY_TO_EMAIL

  const templatesModule = await emailTemplatesModulePromise
  generateVenueBroadcastEmail = templatesModule.generateVenueBroadcastEmail
  generatePasswordResetEmail = templatesModule.generatePasswordResetEmail
  generateWelcomeEmailForUser = templatesModule.generateWelcomeEmailForUser
  generateWelcomeEmailForLocationOwner = templatesModule.generateWelcomeEmailForLocationOwner
  generateContactFormThankYouEmail = templatesModule.generateContactFormThankYouEmail
  generateOrganizeEventThankYouEmail = templatesModule.generateOrganizeEventThankYouEmail
  generateAddVenueThankYouEmail = templatesModule.generateAddVenueThankYouEmail
  generateQuickRequestVenueNotificationEmail = templatesModule.generateQuickRequestVenueNotificationEmail
}

const TEST_EMAIL = 'mark.muron@gmail.com'

interface TestResult {
  template: string
  success: boolean
  error?: string
  messageId?: string
}

async function sendTestEmail(
  template: string,
  emailData: { subject: string; html: string; text: string },
  to: string = TEST_EMAIL
): Promise<TestResult> {
  try {
    console.log(`🚀 Testing ${template}...`)
    
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[TEST] ${emailData.subject}`,
      html: emailData.html,
      text: emailData.text,
      replyTo: REPLY_TO_EMAIL
    })

    console.log(`✅ ${template} sent successfully! Message ID: ${result.data?.id}`)
    return {
      template,
      success: true,
      messageId: result.data?.id
    }
  } catch (error) {
    console.error(`❌ ${template} failed:`, error)
    return {
      template,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function testAllEmailTemplates() {
  console.log('🧪 Testing Resend email functionality...\n')
  
  const results: TestResult[] = []

  // Test 1: Venue Broadcast Email
  const venueData = {
    venueName: 'Test Venue',
    venueContactEmail: 'venue@test.com',
    broadcast: {
      title: 'Test Corporate Event',
      description: 'This is a test description for a corporate event to verify email functionality.',
      eventType: 'corporate',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      guestCount: 50,
      budgetRange: '50,000 - 100,000 Kč',
      locationPreference: 'Praha',
      requirements: 'Projector needed',
      contactName: 'Test Organizer',
      contactEmail: 'organizer@test.com',
      contactPhone: '+420123456789'
    }
  }
  
  results.push(await sendTestEmail(
    'Venue Broadcast Email',
    generateVenueBroadcastEmail(venueData)
  ))

  // Test 2: Password Reset Email
  results.push(await sendTestEmail(
    'Password Reset Email',
    generatePasswordResetEmail('https://prostormat.cz/reset-password?token=test-token-123')
  ))

  // Test 3: Welcome Email for User
  results.push(await sendTestEmail(
    'Welcome Email (User)',
    generateWelcomeEmailForUser({
      name: 'Test User',
      email: TEST_EMAIL
    })
  ))

  // Test 4: Welcome Email for Location Owner
  results.push(await sendTestEmail(
    'Welcome Email (Location Owner)',
    generateWelcomeEmailForLocationOwner({
      name: 'Test Owner',
      email: TEST_EMAIL
    })
  ))

  // Test 5: Contact Form Thank You Email
  results.push(await sendTestEmail(
    'Contact Form Thank You',
    generateContactFormThankYouEmail({
      name: 'Test Contact',
      email: TEST_EMAIL,
      subject: 'Test inquiry about platform',
      message: 'This is a test message from the contact form.'
    })
  ))

  // Test 6: Organize Event Thank You Email
  results.push(await sendTestEmail(
    'Organize Event Thank You',
    generateOrganizeEventThankYouEmail({
      name: 'Test Event Organizer',
      eventType: 'Conference',
      guestCount: 150,
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    })
  ))

  // Test 7: Add Venue Thank You Email
  results.push(await sendTestEmail(
    'Add Venue Thank You',
    generateAddVenueThankYouEmail({
      name: 'Test Venue Owner',
      email: TEST_EMAIL,
      venueName: 'Test Conference Hall',
      venueType: 'conference-hall'
    })
  ))

  // Test 8: Quick Request Venue Notification Email
  const quickRequestData = {
    venueName: 'Test Event Space',
    venueSlug: 'test-event-space',
    broadcastId: 'test-broadcast-id',
    quickRequest: {
      eventType: 'corporate'
    }
  }
  
  results.push(await sendTestEmail(
    'Quick Request Venue Notification',
    generateQuickRequestVenueNotificationEmail(quickRequestData)
  ))

  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`)
  console.log(`❌ Failed: ${failed.length}/${results.length}`)
  
  if (successful.length > 0) {
    console.log('\n✅ Successful templates:')
    successful.forEach(r => console.log(`  - ${r.template} (ID: ${r.messageId})`))
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed templates:')
    failed.forEach(r => console.log(`  - ${r.template}: ${r.error}`))
  }

  console.log(`\n📧 All test emails sent to: ${TEST_EMAIL}`)
  console.log('Check your inbox for the test emails!')
  
  return results
}

// Test basic configuration first
async function testResendConfiguration() {
  console.log('🔧 Testing Resend configuration...')
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY environment variable is not set!')
    return false
  }
  
  console.log('✅ RESEND_API_KEY is configured')
  console.log(`📧 From email: ${FROM_EMAIL}`)
  console.log(`↩️  Reply-to email: ${REPLY_TO_EMAIL}`)
  
  return true
}

// Simple test email
async function sendSimpleTestEmail() {
  console.log('📧 Sending simple test email...')
  
  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: '[SIMPLE TEST] Prostormat Email System Test',
      html: `
        <h1>🎉 Prostormat Email System Test</h1>
        <p>This is a simple test to verify that Resend is working correctly.</p>
        <p><strong>From:</strong> ${FROM_EMAIL}</p>
        <p><strong>Reply-to:</strong> ${REPLY_TO_EMAIL}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>This email was sent from the Prostormat test script.</small></p>
      `,
      text: `
        Prostormat Email System Test
        
        This is a simple test to verify that Resend is working correctly.
        
        From: ${FROM_EMAIL}
        Reply-to: ${REPLY_TO_EMAIL}
        Time: ${new Date().toISOString()}
        
        This email was sent from the Prostormat test script.
      `,
      replyTo: REPLY_TO_EMAIL
    })

    console.log(`✅ Simple test email sent successfully! Message ID: ${result.data?.id}`)
    return true
  } catch (error) {
    console.error('❌ Simple test email failed:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 Prostormat Resend Email Testing Script')
  console.log('=========================================\n')

  await loadEmailModules()

  // Test configuration
  const configOk = await testResendConfiguration()
  if (!configOk) {
    process.exit(1)
  }
  
  console.log('')
  
  // Send simple test first
  const simpleTestOk = await sendSimpleTestEmail()
  if (!simpleTestOk) {
    console.log('❌ Simple test failed - skipping template tests')
    process.exit(1)
  }
  
  console.log('\n')
  
  // Test all templates
  const results = await testAllEmailTemplates()
  
  // Exit with appropriate code
  const allSuccessful = results.every(r => r.success)
  process.exit(allSuccessful ? 0 : 1)
}

main().catch(error => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})
