import { sendEmailFromTemplate } from '../src/lib/email-service'

async function test() {
  console.log('📧 4/4 Sending Venue Broadcast Notification...')
  const result = await sendEmailFromTemplate({
    templateKey: 'venue_broadcast_notification',
    to: 'mark.muron@gmail.com',
    variables: {
      venueName: 'Stylová Galerie v Praze',
      eventType: 'Firemní večírek',
      eventDate: '20.12.2024',
      guestCount: '80',
      budgetRange: '50,000 - 100,000 Kč',
      locationPreference: 'Praha centrum',
      contactName: 'Anna Svobodová',
      contactEmail: 'anna.svobodova@firma.cz',
      contactPhone: '+420 777 987 654',
      description: 'Hledáme stylový prostor pro vánoční firemní večírek. Potřebujeme prostor s kvalitním osvětlením, prezentační technikou a možností cateringu. Preferujeme centrum Prahy.'
    }
  })
  console.log('✅ Venue broadcast email sent!', result)
}

test().catch(console.error).finally(() => process.exit(0))
