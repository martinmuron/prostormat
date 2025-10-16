import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';
import { generateQuickRequestVenueNotificationEmail } from '../src/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuickRequestTest() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set!');
    process.exit(1);
  }

  console.log('📧 Sending quick request notification email to mark.muron@gmail.com...\n');

  const emailData = generateQuickRequestVenueNotificationEmail({
    venueName: 'Medusa Prague',
    venueContactEmail: 'mark.muron@gmail.com',
    quickRequest: {
      eventType: 'firemni-akce',
      eventDate: new Date('2025-03-20'),
      guestCount: 40,
      budgetRange: '30,000 - 50,000 CZK',
      locationPreference: 'Praha 1',
      additionalInfo: 'Potřebujeme projektor, ozvučení a možnost cateringu. Akce bude probíhat od 18:00 do 23:00.',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@example.com',
      contactPhone: '+420 123 456 789'
    }
  });

  try {
    const result = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: 'mark.muron@gmail.com',
      replyTo: 'info@prostormat.cz',
      subject: emailData.subject + ' [TEST EMAIL]',
      html: emailData.html,
      text: emailData.text,
    });

    console.log('✅ Quick request notification email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('\n📝 Email details:');
    console.log('   To: mark.muron@gmail.com');
    console.log('   Subject:', emailData.subject);
    console.log('\n📬 This is the email venue owners receive when someone fills out');
    console.log('   the quick inquiry form on their venue page');
  } catch (error) {
    console.error('❌ Failed to send quick request email:', error);
    throw error;
  }
}

sendQuickRequestTest()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
