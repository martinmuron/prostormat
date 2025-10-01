import { sendEmailFromTemplate } from '../src/lib/email-service'

async function test() {
  console.log('📧 3/4 Sending Venue Inquiry Notification...')
  const result = await sendEmailFromTemplate({
    templateKey: 'venue_inquiry_notification',
    to: 'mark.muron@gmail.com',
    variables: {
      venueName: 'Stylová Galerie v Praze',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@example.com',
      contactPhone: '+420 777 123 456',
      message: 'Dobrý den, zajímá mě pronájem vašeho prostoru na firemní akci 15.12.2024. Potřebujeme prostor pro 50 lidí s možností cateringu.',
      eventDate: '15.12.2024',
      guestCount: '50'
    }
  })
  console.log('✅ Venue inquiry email sent!', result)
}

test().catch(console.error).finally(() => process.exit(0))
