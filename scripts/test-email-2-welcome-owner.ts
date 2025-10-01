import { sendEmailFromTemplate } from '../src/lib/email-service'

async function test() {
  console.log('📧 2/4 Sending Welcome Venue Owner Email...')
  const result = await sendEmailFromTemplate({
    templateKey: 'welcome_location_owner',
    to: 'mark.muron@gmail.com',
    variables: {
      name: 'Mark Muron',
      email: 'mark.muron@gmail.com'
    }
  })
  console.log('✅ Welcome venue owner email sent!', result)
}

test().catch(console.error).finally(() => process.exit(0))
