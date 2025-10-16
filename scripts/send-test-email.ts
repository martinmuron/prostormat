import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST before any other imports
config({ path: resolve(__dirname, '../.env.local') });

// Now import after env is loaded
import { Resend } from 'resend';

// Initialize Resend with the loaded API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  console.log('🔄 Sending test inquiry email to mark.muron@gmail.com...\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set!');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY found (length:', process.env.RESEND_API_KEY.length, ')\n');

  // Sample data for the email
  const broadcast = {
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
  };

  const venueSlug = 'medusa-prague';
  const broadcastId = 'test-broadcast-123';
  const viewDetailsUrl = `https://prostormat.cz/poptavka/${broadcastId}?venue=${venueSlug}`;

  // Generate email HTML (inline template)
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .highlight { background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .details { background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; color: #666; }
        .cta-button {
          display: inline-block;
          background-color: #2196f3;
          color: #fff !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Prostormat</h1>
          <p>Nová poptávka akce</p>
        </div>

        <div class="content">
          <div class="highlight">
            <h2 style="margin-top: 0;">${broadcast.title}</h2>
            <p>${broadcast.description}</p>
          </div>

          <div class="details">
            <h3>Detaily akce</h3>
            <div class="detail-row">
              <span class="detail-label">Typ akce:</span> ${broadcast.eventType}
            </div>
            <div class="detail-row">
              <span class="detail-label">Datum:</span> ${broadcast.eventDate.toLocaleDateString('cs-CZ')}
            </div>
            <div class="detail-row">
              <span class="detail-label">Počet hostů:</span> ${broadcast.guestCount}
            </div>
            <div class="detail-row">
              <span class="detail-label">Rozpočet:</span> ${broadcast.budgetRange}
            </div>
            <div class="detail-row">
              <span class="detail-label">Lokalita:</span> ${broadcast.locationPreference}
            </div>
            <div class="detail-row">
              <span class="detail-label">Požadavky:</span> ${broadcast.requirements}
            </div>
          </div>

          <p style="margin: 30px 0 20px 0;">
            <strong>Máte zájem o tuto akci?</strong> Klikněte na tlačítko níže pro zobrazení kontaktních údajů organizátora.
          </p>

          <div style="text-align: center;">
            <a href="${viewDetailsUrl}" class="cta-button">
              Zobrazit plné detaily
            </a>
          </div>

          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            ⚠️ Kontaktní údaje organizátora jsou dostupné pouze po kliknutí na tlačítko výše.
          </p>
        </div>

        <div class="footer">
          <p><strong>Prostormat</strong></p>
          <p>Platforma pro pronájem event prostorů</p>
          <p><a href="https://prostormat.cz">www.prostormat.cz</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Prostormat - Nová poptávka akce

${broadcast.title}

${broadcast.description}

DETAILY AKCE:
- Typ akce: ${broadcast.eventType}
- Datum: ${broadcast.eventDate.toLocaleDateString('cs-CZ')}
- Počet hostů: ${broadcast.guestCount}
- Rozpočet: ${broadcast.budgetRange}
- Lokalita: ${broadcast.locationPreference}
- Požadavky: ${broadcast.requirements}

Pro zobrazení kontaktních údajů organizátora klikněte na:
${viewDetailsUrl}

---
Prostormat
www.prostormat.cz
  `;

  try {
    const result = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: 'mark.muron@gmail.com',
      replyTo: 'info@prostormat.cz',
      subject: `Nová poptávka akce: ${broadcast.title} [TEST EMAIL]`,
      html: emailHtml,
      text: emailText,
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('\n📝 Email details:');
    console.log('   To: mark.muron@gmail.com');
    console.log('   Subject:', `Nová poptávka akce: ${broadcast.title}`);
    console.log('\n🔗 The email includes a "Zobrazit plné detaily" button');
    console.log('   Button links to:', viewDetailsUrl);
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
