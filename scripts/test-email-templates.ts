import { sendEmailFromTemplate } from '../src/lib/email-service'

async function testAllEmailTemplates() {
  const testEmail = 'mark.muron@gmail.com'

  console.log('🧪 Starting email template tests...')
  console.log(`📧 Sending all test emails to: ${testEmail}\n`)

  // Test 1: Welcome email for regular user
  console.log('1️⃣ Testing: Welcome email for user...')
  try {
    const result1 = await sendEmailFromTemplate({
      templateKey: 'welcome_user',
      to: testEmail,
      variables: {
        name: 'Mark Muron',
        email: testEmail
      }
    })
    console.log('✅ Welcome user email sent:', result1.success ? 'SUCCESS' : 'SKIPPED')
  } catch (error) {
    console.error('❌ Welcome user email failed:', error)
  }

  // Test 2: Welcome email for venue owner
  console.log('\n2️⃣ Testing: Welcome email for venue owner...')
  try {
    const result2 = await sendEmailFromTemplate({
      templateKey: 'welcome_location_owner',
      to: testEmail,
      variables: {
        name: 'Mark Muron',
        email: testEmail
      }
    })
    console.log('✅ Welcome venue owner email sent:', result2.success ? 'SUCCESS' : 'SKIPPED')
  } catch (error) {
    console.error('❌ Welcome venue owner email failed:', error)
  }

  // Test 3: Venue inquiry notification
  console.log('\n3️⃣ Testing: Venue inquiry notification...')
  try {
    const result3 = await sendEmailFromTemplate({
      templateKey: 'venue_inquiry_notification',
      to: testEmail,
      variables: {
        venueName: 'Test Venue - Beautiful Gallery',
        contactName: 'Jan Novák',
        contactEmail: 'jan.novak@example.com',
        contactPhone: '+420 777 123 456',
        message: 'Dobrý den, zajímá mě pronájem vašeho prostoru na firemní akci 15.12.2024. Můžete mě prosím kontaktovat?',
        eventDate: '15.12.2024',
        guestCount: '50'
      }
    })
    console.log('✅ Venue inquiry email sent:', result3.success ? 'SUCCESS' : 'SKIPPED')
  } catch (error) {
    console.error('❌ Venue inquiry email failed:', error)
  }

  // Test 4: Venue broadcast notification
  console.log('\n4️⃣ Testing: Venue broadcast notification...')
  try {
    const result4 = await sendEmailFromTemplate({
      templateKey: 'venue_broadcast_notification',
      to: testEmail,
      variables: {
        venueName: 'Test Venue - Beautiful Gallery',
        eventType: 'Firemní akce',
        eventDate: '15.12.2024',
        guestCount: '80',
        budgetRange: '50,000 - 100,000 Kč',
        locationPreference: 'Praha centrum',
        contactName: 'Anna Svobodová',
        contactEmail: 'anna.svobodova@firma.cz',
        contactPhone: '+420 777 987 654',
        description: 'Hledáme stylový prostor pro vánoční firemní večírek. Potřebujeme prostor s kvalitním osvětlením, prezentační technikou a možností cateringu.'
      }
    })
    console.log('✅ Venue broadcast email sent:', result4.success ? 'SUCCESS' : 'SKIPPED')
  } catch (error) {
    console.error('❌ Venue broadcast email failed:', error)
  }

  console.log('\n✨ All email tests completed!')
  console.log('📬 Check your inbox at mark.muron@gmail.com')
}

testAllEmailTemplates()
  .catch(console.error)
  .finally(() => process.exit(0))
