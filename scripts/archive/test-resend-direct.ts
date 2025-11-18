import { Resend } from 'resend';
import { generateVenueBroadcastEmail } from '../src/lib/email-templates';

async function sendTestEmail() {
  // Use API key directly
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey || apiKey === 'dummy-key') {
    console.error('❌ RESEND_API_KEY not found or invalid');
    console.log('Current value:', apiKey);
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  console.log('🔄 Sending test inquiry email to mark.muron@gmail.com...\n');

  // Sample data for the email
  const emailData = generateVenueBroadcastEmail({
    venueName: 'Test Venue - Medusa Prague',
    venueContactEmail: 'mark.muron@gmail.com',
    venueSlug: 'medusa-prague',
    broadcastId: 'test-broadcast-123',
    broadcast: {
      title: 'Firemní teambuilding pro 50 osob',
      description: 'Hledáme prostor pro firemní teambuilding s možností hudby, cateringu a venkovního posezení. Prostor by měl být v centru Prahy s dobrou dostupností MHD.',
      eventType: 'firemni-akce',
      eventDate: new Date('2025-03-15'),
      guestCount: 50,
      budgetRange: '50,000 - 100,000 CZK',
      locationPreference: 'Praha 1, Praha 2',
      requirements: 'Možnost hudby po 22:00, catering, projektor',
      contactName: 'Jan Novák',
      contactEmail: 'jan.novak@example.com',
      contactPhone: '+420 123 456 789',
    },
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

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('\n📝 Email details:');
    console.log('   To: mark.muron@gmail.com');
    console.log('   Subject:', emailData.subject + ' [TEST EMAIL]');
    console.log('\n🔗 The email includes a "Zobrazit plné detaily" button');
    console.log('   Button links to: https://prostormat.cz/poptavka/test-broadcast-123?venue=medusa-prague');
    console.log('\n⚠️  Note: Contact information (Jan Novák, phone, email) is hidden in the email');
    console.log('   Recipients must click the button to see contact details (if venue is paid)');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    throw error;
  }
}

sendTestEmail()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
