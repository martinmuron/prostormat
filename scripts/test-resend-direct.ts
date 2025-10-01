import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

console.log('🔑 Resend API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')

if (!apiKey) {
  console.error('❌ RESEND_API_KEY not found in environment')
  process.exit(1)
}

const resend = new Resend(apiKey)

async function testResendDirect() {
  console.log('\n📧 Sending direct test email via Resend...\n')

  try {
    const result = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: 'mark.muron@gmail.com',
      subject: '🧪 Test Email from Prostormat',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937;">Test Email from Prostormat</h1>
          <p style="color: #4b5563; font-size: 16px;">
            This is a test email sent directly via Resend API.
          </p>
          <p style="color: #4b5563; font-size: 16px;">
            If you receive this, your Resend integration is working correctly! ✅
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent from: Prostormat Email System
          </p>
        </div>
      `,
      text: 'Test email from Prostormat. If you receive this, your Resend integration is working!'
    })

    console.log('✅ Email sent successfully!')
    console.log('📬 Email ID:', result.data?.id)
    console.log('\nCheck your inbox at mark.muron@gmail.com')
    console.log('Also check your spam/junk folder if not in inbox.')

  } catch (error: any) {
    console.error('❌ Failed to send email:')
    console.error('Error:', error.message)
    console.error('Details:', error)

    if (error.message.includes('domain')) {
      console.log('\n⚠️  Domain Issue Detected!')
      console.log('You need to verify prostormat.cz in Resend:')
      console.log('1. Go to https://resend.com/domains')
      console.log('2. Add prostormat.cz and verify it')
      console.log('3. Or use onboarding@resend.dev for testing')
    }
  }
}

testResendDirect()
  .catch(console.error)
  .finally(() => process.exit(0))
