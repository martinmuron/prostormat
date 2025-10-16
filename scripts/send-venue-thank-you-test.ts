import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';
import { generateAddVenueThankYouEmail } from '../src/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVenueThankYouTest() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set!');
    process.exit(1);
  }

  console.log('📧 Sending venue thank you email to mark.muron@gmail.com...\n');

  const emailData = generateAddVenueThankYouEmail({
    name: 'Mark Muron',
    email: 'mark.muron@gmail.com',
    venueName: 'Medusa Prague',
    venueType: 'Klub'
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

    console.log('✅ Venue thank you email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('\n📝 Email details:');
    console.log('   To: mark.muron@gmail.com');
    console.log('   Subject:', emailData.subject);
  } catch (error) {
    console.error('❌ Failed to send venue thank you email:', error);
    throw error;
  }
}

sendVenueThankYouTest()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
