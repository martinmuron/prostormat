import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') })

import { sendWelcomeEmail } from '../src/lib/email-service'

async function testWelcomeEmail() {
  console.log('🧪 Testing welcome email from database template...\n')

  try {
    const result = await sendWelcomeEmail({
      name: 'Martin Muron',
      email: 'mark.muron@gmail.com',
      role: 'user'
    })

    if (result.success) {
      console.log('✅ Welcome email sent successfully from database!')
      console.log('📧 Email ID:', result.result?.data?.id)
      console.log('\n📝 This email is now fully editable from /admin/email-templates')
      console.log('   Any changes you make in the admin dashboard will apply immediately!')
    } else {
      console.log('⚠️ Email was not sent. Reason:', result.reason)
      if (result.reason === 'trigger_disabled') {
        console.log('   → The email trigger is disabled in the database')
      } else if (result.reason === 'template_inactive') {
        console.log('   → The email template is marked as inactive')
      }
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    throw error
  }
}

testWelcomeEmail()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
