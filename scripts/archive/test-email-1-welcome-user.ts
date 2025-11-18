import { sendEmailFromTemplate } from '../src/lib/email-service'

async function test() {
  console.log('📧 1/4 Sending Welcome User Email...')
  const result = await sendEmailFromTemplate({
    templateKey: 'welcome_user',
    to: 'mark.muron@gmail.com',
    variables: {
      name: 'Mark Muron',
      email: 'mark.muron@gmail.com'
    }
  })
  console.log('✅ Welcome user email sent!', result)
}

test().catch(console.error).finally(() => process.exit(0))
