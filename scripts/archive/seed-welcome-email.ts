import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding welcome email template...')

  // Seed welcome email template
  const welcomeTemplate = await prisma.emailTemplate.upsert({
    where: { templateKey: 'welcome_user' },
    update: {
      name: 'Uvítací email pro nové uživatele',
      subject: 'Vítej na Prostormatu! 🎉 Objev prostor pro svou další akci',
      description: 'Automaticky odesláno při registraci nového uživatele',
      variables: ['{{name}}'],
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
    .content { background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; margin-bottom: 20px; font-size: 24px; }
    p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0; }
    ul { color: #4b5563; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px; }
    ul li { margin: 12px 0; }
    .cta-button {
      display: block;
      background-color: #3b82f6;
      color: white !important;
      padding: 14px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 0;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .cta-button:hover { background-color: #2563eb; }
    .button-container { margin: 24px 0; }
    .footer { color: #6b7280; font-size: 14px; margin-top: 24px; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .highlight { background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; }
    @media only screen and (max-width: 600px) {
      .container { padding: 10px !important; }
      .content { padding: 20px !important; }
      h1 { font-size: 20px !important; }
      p, ul li { font-size: 15px !important; }
      .cta-button { padding: 12px 16px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>Ahoj {{name}}! 🎉</h1>
      <p>děkujeme, že ses připojil/a k <strong>Prostormatu</strong> — největší platformě na eventové prostory v Praze (<a href="https://prostormat.cz" style="color: #3b82f6;">prostormat.cz</a>).</p>
      <p><strong>Teď můžeš:</strong></p>
      <ul>
        <li><strong>Procházet stovky jedinečných prostorů</strong> podle kapacity, typu nebo lokality</li>
        <li><strong>Vytvořit poptávku</strong> – popiš svou akci a nech majitele prostorů se ozvat tobě</li>
        <li><strong>Poslat hromadnou poptávku</strong> – vyplň jeden formulář a všechny prostory, které splní tvoji kritéria, dostanou email!</li>
      </ul>
      <div class="button-container">
        <a href="https://prostormat.cz/prostory" class="cta-button">📍 Procházet prostory</a>
        <a href="https://prostormat.cz/rychla-poptavka" class="cta-button">✉️ Rychlá poptávka</a>
      </div>
      <div class="highlight">
        <p style="margin: 0;"><strong>Máte prostor a chcete ho přidat a oslovit více klientů?</strong></p>
        <div style="margin-top: 12px;">
          <a href="https://prostormat.cz/pridat-prostor" class="cta-button">➕ Přidat prostor</a>
        </div>
      </div>
      <p>Pokud si s něčím nevíš rady (výběr prostoru, přidání prostoru, kontakty), ozvi se nám na <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a></p>
      <p style="margin-top: 24px;">Ještě jednou vítej mezi námi — těšíme se, až tvá akce dostane prostor, který si zaslouží! ✨</p>
      <div class="footer">
        <p><strong>S pozdravem,</strong><br>Tým Prostormat<br><a href="https://prostormat.cz">prostormat.cz</a></p>
      </div>
    </div>
  </div>
</body>
</html>`,
      textContent: `Ahoj {{name}},

děkujeme, že ses připojil/a k Prostormatu — největší platformě na eventové prostory v Praze (prostormat.cz).

Teď můžeš:

• Procházet stovky jedinečných prostorů podle kapacity, typu nebo lokality
  → https://prostormat.cz/prostory

• Vytvořit poptávku – popiš svou akci a nech majitele prostorů se ozvat tobě
  → https://prostormat.cz/rychla-poptavka

• Poslat hromadnou poptávku – vyplň jeden formulář a všechny prostory, které splní tvoji kritéria, dostanou email!

Máte prostor a chcete ho přidat a oslovit více klientů?
→ https://prostormat.cz/pridat-prostor

Pokud si s něčím nevíš rady (výběr prostoru, přidání prostoru, kontakty), ozvi se nám na info@prostormat.cz

Ještě jednou vítej mezi námi — těšíme se, až tvá akce dostane prostor, který si zaslouží! ✨

S pozdravem,
Tým Prostormat
prostormat.cz`,
      isActive: true,
      updatedAt: new Date()
    },
    create: {
      templateKey: 'welcome_user',
      name: 'Uvítací email pro nové uživatele',
      subject: 'Vítej na Prostormatu! 🎉 Objev prostor pro svou další akci',
      description: 'Automaticky odesláno při registraci nového uživatele',
      variables: ['{{name}}'],
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
    .content { background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; margin-bottom: 20px; font-size: 24px; }
    p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0; }
    ul { color: #4b5563; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px; }
    ul li { margin: 12px 0; }
    .cta-button {
      display: block;
      background-color: #3b82f6;
      color: white !important;
      padding: 14px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 0;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .cta-button:hover { background-color: #2563eb; }
    .button-container { margin: 24px 0; }
    .footer { color: #6b7280; font-size: 14px; margin-top: 24px; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .highlight { background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; }
    @media only screen and (max-width: 600px) {
      .container { padding: 10px !important; }
      .content { padding: 20px !important; }
      h1 { font-size: 20px !important; }
      p, ul li { font-size: 15px !important; }
      .cta-button { padding: 12px 16px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>Ahoj {{name}}! 🎉</h1>
      <p>děkujeme, že ses připojil/a k <strong>Prostormatu</strong> — největší platformě na eventové prostory v Praze (<a href="https://prostormat.cz" style="color: #3b82f6;">prostormat.cz</a>).</p>
      <p><strong>Teď můžeš:</strong></p>
      <ul>
        <li><strong>Procházet stovky jedinečných prostorů</strong> podle kapacity, typu nebo lokality</li>
        <li><strong>Vytvořit poptávku</strong> – popiš svou akci a nech majitele prostorů se ozvat tobě</li>
        <li><strong>Poslat hromadnou poptávku</strong> – vyplň jeden formulář a všechny prostory, které splní tvoji kritéria, dostanou email!</li>
      </ul>
      <div class="button-container">
        <a href="https://prostormat.cz/prostory" class="cta-button">📍 Procházet prostory</a>
        <a href="https://prostormat.cz/rychla-poptavka" class="cta-button">✉️ Rychlá poptávka</a>
      </div>
      <div class="highlight">
        <p style="margin: 0;"><strong>Máte prostor a chcete ho přidat a oslovit více klientů?</strong></p>
        <div style="margin-top: 12px;">
          <a href="https://prostormat.cz/pridat-prostor" class="cta-button">➕ Přidat prostor</a>
        </div>
      </div>
      <p>Pokud si s něčím nevíš rady (výběr prostoru, přidání prostoru, kontakty), ozvi se nám na <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a></p>
      <p style="margin-top: 24px;">Ještě jednou vítej mezi námi — těšíme se, až tvá akce dostane prostor, který si zaslouží! ✨</p>
      <div class="footer">
        <p><strong>S pozdravem,</strong><br>Tým Prostormat<br><a href="https://prostormat.cz">prostormat.cz</a></p>
      </div>
    </div>
  </div>
</body>
</html>`,
      textContent: `Ahoj {{name}},

děkujeme, že ses připojil/a k Prostormatu — největší platformě na eventové prostory v Praze (prostormat.cz).

Teď můžeš:

• Procházet stovky jedinečných prostorů podle kapacity, typu nebo lokality
  → https://prostormat.cz/prostory

• Vytvořit poptávku – popiš svou akci a nech majitele prostorů se ozvat tobě
  → https://prostormat.cz/rychla-poptavka

• Poslat hromadnou poptávku – vyplň jeden formulář a všechny prostory, které splní tvoji kritéria, dostanou email!

Máte prostor a chcete ho přidat a oslovit více klientů?
→ https://prostormat.cz/pridat-prostor

Pokud si s něčím nevíš rady (výběr prostoru, přidání prostoru, kontakty), ozvi se nám na info@prostormat.cz

Ještě jednou vítej mezi námi — těšíme se, až tvá akce dostane prostor, který si zaslouží! ✨

S pozdravem,
Tým Prostormat
prostormat.cz`,
      isActive: true
    }
  })

  console.log(`✅ Seeded template: ${welcomeTemplate.name}`)

  // Seed email trigger
  const trigger = await prisma.emailTrigger.upsert({
    where: { triggerKey: 'user_registration' },
    update: {
      name: 'Registrace uživatele',
      description: 'Odesláno při registraci nového uživatele',
      templateKey: 'welcome_user',
      isEnabled: true,
      updatedAt: new Date()
    },
    create: {
      triggerKey: 'user_registration',
      name: 'Registrace uživatele',
      description: 'Odesláno při registraci nového uživatele',
      templateKey: 'welcome_user',
      isEnabled: true
    }
  })

  console.log(`✅ Seeded trigger: ${trigger.name}`)
  console.log('\n✨ Welcome email template seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding welcome email template:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
