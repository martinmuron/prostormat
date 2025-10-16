import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmails() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set!');
    process.exit(1);
  }

  console.log('📧 Sending welcome emails to mark.muron@gmail.com...\n');

  // Welcome email for regular user
  const userEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Vítejte v Prostormatu, Mark!</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Jsme rádi, že jste se k nám připojili. Prostormat je platforma, která vám pomůže najít perfektní prostor pro vaši akci.
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Začněte procházet naše prostory nebo vytvořte vlastní poptávku a nechte prostory reagovat přímo na vás.
        </p>
        <div style="margin: 30px 0;">
          <a href="https://prostormat.cz/prostory" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Procházet prostory
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Máte dotazy? Kontaktujte nás na <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a>
        </p>
      </div>
    </div>
  `;

  // Welcome email for venue owner
  const ownerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Vítejte v Prostormatu, Mark!</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Děkujeme, že jste se rozhodli nabízet své prostory na naší platformě. Pomůžeme vám oslovit nové klienty a naplnit vaše prostory akcemi.
        </p>
        <h2 style="color: #1f2937; font-size: 18px; margin-top: 24px;">Další kroky:</h2>
        <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
          <li>Přidejte svůj první prostor</li>
          <li>Nahrajte kvalitní fotografie</li>
          <li>Vyplňte detailní popis a vybavení</li>
          <li>Začněte přijímat poptávky</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="https://prostormat.cz/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Přidat prostor
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Potřebujete pomoc? Kontaktujte nás na <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a>
        </p>
      </div>
    </div>
  `;

  try {
    // Send user welcome email
    console.log('1️⃣ Sending regular user welcome email...');
    const userResult = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: 'mark.muron@gmail.com',
      replyTo: 'info@prostormat.cz',
      subject: 'Vítejte v Prostormatu! [TEST EMAIL]',
      html: userEmailHtml,
      text: 'Vítejte v Prostormatu, Mark! Jsme rádi, že jste se k nám připojili.',
    });

    console.log('✅ User welcome email sent!');
    console.log('   Email ID:', userResult.data?.id);
    console.log('   Subject: Vítejte v Prostormatu!\n');

    // Send venue owner welcome email
    console.log('2️⃣ Sending venue owner welcome email...');
    const ownerResult = await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: 'mark.muron@gmail.com',
      replyTo: 'info@prostormat.cz',
      subject: 'Vítejte v Prostormatu - Začněte nabízet své prostory! [TEST EMAIL]',
      html: ownerEmailHtml,
      text: 'Vítejte v Prostormatu, Mark! Začněte nabízet své prostory.',
    });

    console.log('✅ Venue owner welcome email sent!');
    console.log('   Email ID:', ownerResult.data?.id);
    console.log('   Subject: Vítejte v Prostormatu - Začněte nabízet své prostory!\n');

    console.log('📬 Both welcome emails sent successfully to mark.muron@gmail.com');
  } catch (error) {
    console.error('❌ Failed to send welcome emails:', error);
    throw error;
  }
}

sendWelcomeEmails()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
