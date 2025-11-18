/**
 * Test script for GA4 Server-Side Tracking
 *
 * Run this to verify your GA4 Measurement Protocol setup is working correctly.
 *
 * Usage:
 *   npx tsx scripts/test-ga4-server-tracking.ts
 */

import {
  trackGA4ServerRegistration,
  trackGA4ServerPayment,
  trackGA4ServerLocationRegistration,
  trackGA4ServerLead,
  validateGA4Event,
  generateClientId,
} from '../src/lib/ga4-server-tracking'

async function testGA4ServerTracking() {
  console.log('🧪 Testing GA4 Server-Side Tracking...\n')

  const testClientId = generateClientId()
  const testUserId = 'test-user-123'

  // Test 1: Validate Event (doesn't send to GA4, just validates)
  console.log('📝 Test 1: Validating event structure...')
  const validation = await validateGA4Event({
    client_id: testClientId,
    user_id: testUserId,
    events: [
      {
        name: 'test_event',
        params: {
          test_param: 'test_value',
        },
      },
    ],
  })

  if (validation.valid) {
    console.log('✅ Event structure is valid\n')
  } else {
    console.log('❌ Event validation failed:')
    console.log(validation.validationMessages)
    console.log('')
  }

  // Test 2: Registration Event
  console.log('📝 Test 2: Sending registration event...')
  const registrationResult = await trackGA4ServerRegistration({
    userId: testUserId,
    clientId: testClientId,
    email: 'test@example.com',
    method: 'email',
  })

  if (registrationResult.success) {
    console.log('✅ Registration event sent successfully\n')
  } else {
    console.log('❌ Registration event failed:', registrationResult.error)
    console.log('')
  }

  // Test 3: Payment Event
  console.log('📝 Test 3: Sending payment event...')
  const paymentResult = await trackGA4ServerPayment({
    userId: testUserId,
    clientId: testClientId,
    transactionId: `test-txn-${Date.now()}`,
    value: 12000,
    currency: 'CZK',
    venueName: 'Test Venue',
    venueId: 'test-venue-123',
    subscription: true,
  })

  if (paymentResult.success) {
    console.log('✅ Payment event sent successfully\n')
  } else {
    console.log('❌ Payment event failed:', paymentResult.error)
    console.log('')
  }

  // Test 4: Location Registration Event
  console.log('📝 Test 4: Sending location registration event...')
  const locationResult = await trackGA4ServerLocationRegistration({
    userId: testUserId,
    clientId: testClientId,
    venueName: 'Test Venue',
    venueId: 'test-venue-123',
    mode: 'new',
  })

  if (locationResult.success) {
    console.log('✅ Location registration event sent successfully\n')
  } else {
    console.log('❌ Location registration event failed:', locationResult.error)
    console.log('')
  }

  // Test 5: Lead Generation Event
  console.log('📝 Test 5: Sending lead generation event...')
  const leadResult = await trackGA4ServerLead({
    userId: testUserId,
    clientId: testClientId,
    formType: 'bulk_request',
    eventType: 'Conference',
    guestCount: 100,
    location: 'Praha 1',
    budgetRange: '100000-200000',
    email: 'test@example.com',
  })

  if (leadResult.success) {
    console.log('✅ Lead generation event sent successfully\n')
  } else {
    console.log('❌ Lead generation event failed:', leadResult.error)
    console.log('')
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))
  console.log('')
  console.log('Test Client ID:', testClientId)
  console.log('Test User ID:', testUserId)
  console.log('')
  console.log('Results:')
  console.log('  Validation:', validation.valid ? '✅ Pass' : '❌ Fail')
  console.log('  Registration:', registrationResult.success ? '✅ Pass' : '❌ Fail')
  console.log('  Payment:', paymentResult.success ? '✅ Pass' : '❌ Fail')
  console.log('  Location Registration:', locationResult.success ? '✅ Pass' : '❌ Fail')
  console.log('  Lead Generation:', leadResult.success ? '✅ Pass' : '❌ Fail')
  console.log('')
  console.log('Next Steps:')
  console.log('  1. Check GA4 Real-Time reports: https://analytics.google.com/')
  console.log('  2. Navigate to: Reports → Realtime → Event count by Event name')
  console.log('  3. Look for these test events (they should appear within 30 seconds):')
  console.log('     - sign_up')
  console.log('     - purchase')
  console.log('     - location_registration')
  console.log('     - generate_lead')
  console.log('')
  console.log('⚠️  Note: Test events will appear in your production GA4 property.')
  console.log('    You may want to filter them out in your GA4 reports.')
  console.log('')
}

// Run the tests
testGA4ServerTracking()
  .then(() => {
    console.log('✅ All tests completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed with error:', error)
    process.exit(1)
  })
