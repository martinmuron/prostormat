import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const emailTemplates = [
  // 1. Welcome Email (NEW - unified for all users)
  {
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
  },

  // 2. Venue Broadcast Email (Freemium - hides contact info)
  {
    templateKey: 'venue_broadcast',
    name: 'Poptávka akce pro prostor (Freemium)',
    subject: 'Nová poptávka akce: {{title}}',
    description: 'Email odeslaný majitelům prostorů při nové veřejné poptávce (skryté kontakty)',
    variables: ['{{venueName}}', '{{venueSlug}}', '{{broadcastId}}', '{{title}}', '{{description}}', '{{eventType}}', '{{eventDate}}', '{{guestCount}}', '{{budgetRange}}', '{{locationPreference}}', '{{requirements}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nová poptávka akce</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: 600; color: #495057; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Nová poptávka akce</p>
        </div>
        <div class="content">
            <h2 style="color: #212529; margin-bottom: 10px;">Dobrý den,</h2>
            <p>máme pro vás novou poptávku akce, která by mohla odpovídat vašemu prostoru <strong>{{venueName}}</strong>.</p>
            <div class="highlight">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">{{title}}</h3>
                <p style="margin: 0; color: #424242;">{{description}}</p>
            </div>
            <div class="event-details">
                <h4 style="margin: 0 0 15px 0; color: #212529;">Detaily akce:</h4>
                <div class="detail-row"><span class="label">Typ akce:</span> {{eventType}}</div>
                <div class="detail-row"><span class="label">Datum akce:</span> {{eventDate}}</div>
                <div class="detail-row"><span class="label">Počet hostů:</span> {{guestCount}}</div>
                <div class="detail-row"><span class="label">Rozpočet:</span> {{budgetRange}}</div>
                <div class="detail-row"><span class="label">Lokalita:</span> {{locationPreference}}</div>
                <div class="detail-row"><span class="label">Požadavky:</span> {{requirements}}</div>
            </div>
            <p style="margin: 30px 0 20px 0;"><strong>Máte zájem o tuto akci?</strong> Klikněte na tlačítko níže pro zobrazení kontaktních údajů organizátora.</p>
            <a href="https://prostormat.cz/poptavka/{{broadcastId}}?venue={{venueSlug}}" class="cta-button">Zobrazit plné detaily</a>
        </div>
        <div class="footer">
            <p><strong>Prostormat</strong> - Platforma pro hledání event prostorů</p>
            <p>Tento email jste obdrželi, protože váš prostor byl automaticky vybrán na základě kritérií poptávky.</p>
            <p><a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a></p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Nová poptávka akce přes Prostormat

Dobrý den,

máme pro vás novou poptávku akce pro váš prostor {{venueName}}.

{{title}}
{{description}}

Detaily akce:
- Typ akce: {{eventType}}
- Datum akce: {{eventDate}}
- Počet hostů: {{guestCount}}
- Rozpočet: {{budgetRange}}
- Lokalita: {{locationPreference}}
- Požadavky: {{requirements}}

Máte zájem o tuto akci? Zobrazit plné detaily (včetně kontaktních údajů):
https://prostormat.cz/poptavka/{{broadcastId}}?venue={{venueSlug}}

--
Prostormat - Platforma pro hledání event prostorů
prostormat.cz | info@prostormat.cz`,
    isActive: true
  }
]

// Continue in next message due to token limit...
