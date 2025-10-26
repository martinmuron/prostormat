export type EmailTemplateDefinition = {
  templateKey: string
  name: string
  subject: string
  description: string | null
  variables: string[]
  htmlContent: string
  textContent: string | null
  isActive: boolean
}

export type EmailTriggerDefinition = {
  triggerKey: string
  name: string
  description: string | null
  templateKey: string
  isEnabled: boolean
}

export const emailTemplateDefinitions: EmailTemplateDefinition[] = [
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
  {
    templateKey: 'welcome_location_owner',
    name: 'Uvítací email pro majitele prostoru',
    subject: 'Vítejte v Prostormatu – Připravte svůj prostor na poptávky',
    description: 'Odesláno při registraci majitele prostoru',
    variables: ['{{name}}'],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
    .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid rgba(15, 23, 42, 0.08); }
    h1 { color: #111827; margin-bottom: 20px; font-size: 28px; }
    p { color: #4b5563; font-size: 16px; margin: 16px 0; }
    ul { color: #4b5563; font-size: 16px; margin: 20px 0; padding-left: 24px; }
    ul li { margin: 12px 0; }
    .cta-button {
      display: inline-block;
      background-color: #111827;
      color: white !important;
      padding: 14px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      transition: all 0.2s ease;
    }
    .cta-button:hover { background-color: #1f2937; }
    .highlight { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .steps { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
    .step { display: flex; gap: 12px; align-items: flex-start; }
    .step-number { width: 32px; height: 32px; border-radius: 50%; background-color: #111827; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .footer { color: #6b7280; font-size: 15px; margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 24px; }
    @media only screen and (max-width: 600px) {
      .email-container { padding: 16px !important; }
      .card { padding: 24px !important; }
      h1 { font-size: 24px !important; }
      p, ul li { font-size: 15px !important; }
      .cta-button { width: 100%; text-align: center; padding: 16px 20px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="card">
      <h1>Vítejte, {{name}}! 👋</h1>
      <p>moc nás těší, že jste se připojili k <strong>Prostormat.cz</strong> – největší platformě pro nabídku eventových prostorů v Praze s více než 850+ registrovanými prostory.</p>
      <p>Jste skvělým krokem blíž k oslovování firem, eventových agentur i jednotlivců, kteří hledají ideální místo pro své akce. Aby váš prostor zazářil a začaly přicházet poptávky, doporučujeme dokončit tyto kroky:</p>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div>
            <strong>Vyplňte profil vašeho prostoru na 100 %</strong>
            <p style="margin: 8px 0 0;">Doplňte fotky, popis, kapacity, ceník a služby, které nabízíte. Kompletní profily se zobrazují výše a získávají více poptávek.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div>
            <strong>Aktivujte Premium zvýraznění</strong>
            <p style="margin: 8px 0 0;">Získejte přednostní pozice v katalogu, více poptávek a možnost zobrazení v prémiových sekcích (homepage, doporučené prostory).</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div>
            <strong>Odpovídejte rychle na poptávky</strong>
            <p style="margin: 8px 0 0;">Na poptávky reagujte co nejdříve – rychlá reakce zvyšuje šanci na úspěšné uzavření rezervace.</p>
          </div>
        </div>
      </div>

      <a href="https://prostormat.cz/pridat-prostor" class="cta-button">Dokončit profil prostoru</a>

      <div class="highlight">
        <h2 style="margin-top: 0;">Co získáte s Prostormat Premium?</h2>
        <ul>
          <li>Zvýraznění v katalogu a prioritní zobrazení ve výsledcích</li>
          <li>Zařazení mezi doporučené prostory na homepage</li>
          <li>Zvýšený počet poptávek a přístup k firemním klientům</li>
          <li>Možnost propagovat speciální nabídky nebo akce</li>
        </ul>
      </div>

      <p>Pokud potřebujete poradit s nastavením profilu nebo prezentací prostoru, jsme tu pro vás.</p>
      <p>Napište nám na <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a> nebo volejte <strong>+420 739 808 918</strong>.</p>

      <div class="footer">
        <p style="margin: 0;"><strong>Děkujeme, že jste s námi!</strong></p>
        <p style="margin: 8px 0;">Tým Prostormat.cz</p>
        <p style="margin: 8px 0;"><a href="https://prostormat.cz" style="color: #3b82f6;">prostormat.cz</a></p>
      </div>
    </div>
  </div>
</body>
</html>`,
    textContent: `Vítejte v Prostormat.cz 👋

Ahoj {{name}},

děkujeme, že jste se připojili k Prostormat.cz – největší platformě pro nabídku eventových prostorů v Praze.

🔹 Co udělat jako první?
1. Doplňte profil vašeho prostoru (fotky, popis, kapacity, ceník)
2. Aktivujte Premium zvýraznění pro více poptávek
3. Reagujte rychle na poptávky pro vyšší úspěšnost

🎯 Výhody Prostormat Premium:
- Prioritní zobrazení v katalogu
- Doporučení na homepage
- Více poptávek od firem i agentur

Potřebujete pomoci? Jsme tu pro vás:
info@prostormat.cz | +420 739 808 918

    Tým Prostormat.cz`,
    isActive: true
  },
  {
    templateKey: 'add_venue_thank_you',
    name: 'Děkujeme za přidání prostoru',
    subject: 'Děkujeme za přidání prostoru, {{name}}!',
    description: 'Email odeslaný majitelům prostoru po přidání nového prostoru',
    variables: ['{{name}}', '{{venueName}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Děkujeme za přidání prostoru, {{name}}!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
        .next-steps { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .contact-info { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Děkujeme za přidání prostoru</p>
        </div>

        <div class="content">
            <h2 style="color: #212529; margin-bottom: 20px;">Ahoj {{name}}! 🎉</h2>

            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">✅ Váš prostor byl úspěšně přidán!</h3>
                <p style="margin: 0;">Děkujeme, že jste přidali {{venueName}} do naší platformy. Váš prostor je nyní v procesu schvalování.</p>
            </div>

            <div class="next-steps">
                <h3 style="margin: 0 0 15px 0; color: #0056b3;">🔄 Co bude následovat:</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li><strong>Kontrola prostoru</strong> - Náš tým zkontroluje všechny údaje (1-2 pracovní dny)</li>
                    <li><strong>Schválení</strong> - Po schválení bude váš prostor zveřejněn na platformě.</li>
                </ol>
            </div>

            <div style="margin: 30px 0;">
                <a href="https://prostormat.cz/dashboard" class="cta-button">
                    Přihlásit se do dashboardu
                </a>
            </div>

            <div class="contact-info">
                <h3 style="margin: 0 0 15px 0; color: #856404;">🤝 Náš obchodní tým vás brzy kontaktuje</h3>
                <p style="margin: 0; color: #856404;">Jeden z našich specialistů se vám ozve <strong>do 24 hodin</strong> pro dokončení procesu a zodpovězení všech otázek.</p>
            </div>

            <p><strong>Máte otázky hned teď?</strong> Neváhejte nás kontaktovat:</p>
            <p>📧 <a href="mailto:info@prostormat.cz" style="color: #000;">info@prostormat.cz</a></p>
        </div>

        <div class="footer">
            <p><strong>Prostormat</strong> – Platforma pro pronájem event prostorů</p>
            <p>Tento email je automatické potvrzení přidání nového prostoru.</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> |
                <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Děkujeme za přidání prostoru, {{name}}!

Váš prostor byl úspěšně přidán!

Děkujeme, že jste přidali {{venueName}} do naší platformy. Váš prostor je nyní v procesu schvalování.

CO BUDE NÁSLEDOVAT:
1. Kontrola prostoru - Náš tým zkontroluje všechny údaje (1-2 pracovní dny)
2. Schválení - Po schválení bude váš prostor zveřejněn na platformě.

Přihlásit se do dashboardu: https://prostormat.cz/dashboard

NÁŠ OBCHODNÍ TÝM VÁS BRZY KONTAKTUJE:
Jeden z našich specialistů se vám ozve do 24 hodin pro dokončení procesu a zodpovězení všech otázek.

Máte otázky hned teď?
Email: info@prostormat.cz

--
Prostormat – Platforma pro pronájem event prostorů
Tento email je automatické potvrzení přidání nového prostoru.
prostormat.cz | info@prostormat.cz`,
    isActive: true
  },
  {
    templateKey: 'contact_form_thank_you',
    name: 'Děkujeme za kontaktní zprávu',
    subject: 'Děkujeme za vaši zprávu, {{name}}!',
    description: 'Automatická odpověď na kontaktní formulář',
    variables: ['{{name}}', '{{subject}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Děkujeme za vaši zprávu, {{name}}!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
        .response-time { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Děkujeme za váš zájem</p>
        </div>

        <div class="content">
            <h2 style="color: #212529; margin-bottom: 20px;">Ahoj {{name}}! 👋</h2>

            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">✅ Vaše zpráva byla úspěšně odeslána!</h3>
                <p style="margin: 0;">Děkujeme, že jste nás kontaktovali. Vaši zprávu jsme obdrželi a brzy se vám ozveme.</p>
            </div>

            <p>Potvrzujeme, že jsme obdrželi vaši zprávu týkající se: <strong>"{{subject}}"</strong></p>

            <div class="response-time">
                <h3 style="margin: 0 0 10px 0; color: #856404;">⏰ Doba odezvy</h3>
                <p style="margin: 0; color: #856404;"><strong>Odpovíme vám do 24 hodin</strong> během pracovních dnů (pondělí-pátek).</p>
            </div>

            <p>Mezitím můžete:</p>
            <ul>
                <li>📍 <strong>Prohlédnout si naše prostory</strong> - Objevte stovky event prostorů</li>
                <li>📚 <strong>Přečíst si FAQ</strong> - Možná najdete odpověď na vaši otázku</li>
                <li>📧 <strong>Sledovat náš blog</strong> - Tipy a trendy pro eventy</li>
                <li>📱 <strong>Sledovat nás na sociálních sítích</strong> - Nejnovější aktuality</li>
            </ul>

            <div style="margin: 30px 0;">
                <a href="https://prostormat.cz/prostory" class="cta-button">
                    Prohlédnout prostory
                </a>
                <a href="https://prostormat.cz/faq" class="cta-button" style="background: #f8f9fa; color: #000; border: 2px solid #000; margin-left: 10px;">
                    Zobrazit FAQ
                </a>
            </div>

            <div class="contact-info">
                <h3 style="margin: 0 0 15px 0; color: #212529;">Potřebujete okamžitou pomoc?</h3>
                <p style="margin: 0;"><strong>📧 Email:</strong> <a href="mailto:info@prostormat.cz" style="color: #000;">info@prostormat.cz</a></p>
                <p style="margin: 5px 0 0 0;"><strong>📞 Telefon:</strong> <a href="tel:+420775654639" style="color: #000;">+420 775 654 639</a></p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Prostormat</strong> – Platforma pro hledání event prostorů</p>
            <p>Tento email je automatická odpověď na vaši zprávu odeslanou přes kontaktní formulář.</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> |
                <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Děkujeme za vaši zprávu, {{name}}!

Vaše zpráva byla úspěšně odeslána!

Potvrzujeme, že jsme obdrželi vaši zprávu týkající se: "{{subject}}"

DOBA ODEZVY:
Odpovíme vám do 24 hodin během pracovních dnů (pondělí-pátek).

Mezitím můžete:
- Prohlédnout si naše prostory na: https://prostormat.cz/prostory
- Přečíst si FAQ na: https://prostormat.cz/faq
- Sledovat náš blog pro tipy a trendy

Potřebujete okamžitou pomoc?
Email: info@prostormat.cz
Telefon: +420 775 654 639

--
Prostormat – Platforma pro hledání event prostorů
Tento email je automatická odpověď na vaši zprávu.
prostormat.cz | info@prostormat.cz`,
    isActive: true
  },
  {
    templateKey: 'contact_form_admin',
    name: 'Notifikace admina - kontaktní formulář',
    subject: 'Nová zpráva z kontaktního formuláře: {{subject}}',
    description: 'Email odeslaný administrátorovi při nové zprávě z kontaktního formuláře',
    variables: ['{{name}}', '{{email}}', '{{subject}}', '{{message}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nová zpráva z kontaktního formuláře</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Nová zpráva z kontaktního formuláře</p>
        </div>

        <div class="content">
            <h2 style="color: #212529; margin-bottom: 20px;">Nový kontakt od uživatele</h2>

            <p><strong>Jméno:</strong> {{name}}</p>
            <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
            <p><strong>Předmět:</strong> {{subject}}</p>

            <div class="message-box">
                <h3 style="margin: 0 0 15px 0; color: #2196f3;">Zpráva:</h3>
                <p style="margin: 0; white-space: pre-wrap;">{{message}}</p>
            </div>

            <p><strong>Odpovězte do 24 hodin!</strong> Uživatel očekává odpověď během pracovních dnů.</p>
        </div>

        <div class="footer">
            <p><strong>Prostormat</strong> – Administrace kontaktních formulářů</p>
            <p>Tento email byl automaticky vygenerován z kontaktního formuláře na webu.</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Nová zpráva z kontaktního formuláře - Prostormat

Jméno: {{name}}
Email: {{email}}
Předmět: {{subject}}

Zpráva:
{{message}}

Odpovězte do 24 hodin! Uživatel očekává odpověď během pracovních dnů.

--
Prostormat – Administrace kontaktních formulářů
Tento email byl automaticky vygenerován z kontaktního formuláře na webu.`,
    isActive: true
  },
  {
    templateKey: 'organize_event_thank_you',
    name: 'Děkujeme za poptávku organizace akce',
    subject: 'Děkujeme – postaráme se o vaši akci',
    description: 'Email odeslaný uživatelům po vyplnění formuláře organizace akce',
    variables: ['{{name}}', '{{eventType}}', '{{guestCount}}', '{{eventDate}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Děkujeme – postaráme se o vaši akci</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; margin:0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #000; color: #fff; padding: 28px 24px; }
    .content { padding: 32px 24px; }
    .cta { display: inline-block; background: #000; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .muted { color: #555; }
    .note { background: #fff3cd; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b; }
    .footer { padding: 20px 24px; color: #666; background: #f7f7f7; font-size: 14px; }
  </style>
  </head>
  <body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Prostormat</h1>
      <p style="margin:8px 0 0 0; opacity:.9">Organizace vaší akce</p>
    </div>
    <div class="content">
      <p>Ahoj {{name}} 👋</p>
      <p>Děkujeme za váš zájem – náš tým se vám brzy ozve s návrhem prostorů a kompletní organizací akce.</p>
      <div class="note" style="margin: 20px 0;">
        <strong>Vzhledem k vysoké poptávce</strong> aktuálně přijímáme pouze akce pro <strong>30+ osob</strong>.
      </div>
      <p>Mezitím si můžete prohlédnout vybrané prostory:</p>
      <p>
        <a class="cta" href="https://prostormat.cz/prostory">Prohlédnout prostory</a>
      </p>
      <p class="muted">Pokud máte doplňující informace, stačí odpovědět na tento e‑mail.</p>
    </div>
    <div class="footer">
      <p>Prostormat – Platforma pro hledání event prostorů</p>
      <p>info@prostormat.cz • prostormat.cz</p>
    </div>
  </div>
  </body>
  </html>`,
    textContent: `Děkujeme – postaráme se o vaši akci

Ahoj {{name}},
děkujeme za váš zájem – brzy se vám ozveme s návrhem prostorů a kompletní organizací akce.

Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.

Prostory: https://prostormat.cz/prostory

Prostormat – Platforma pro hledání event prostorů`,
    isActive: true
  },
  {
    templateKey: 'organize_event_admin',
    name: 'Notifikace admina - nová poptávka organizace',
    subject: 'Nová poptávka na organizaci akce',
    description: 'Email odeslaný administrátorovi při nové poptávce na organizaci akce',
    variables: ['{{name}}', '{{email}}', '{{phone}}', '{{company}}', '{{eventType}}', '{{guestCount}}', '{{eventDate}}', '{{budgetRange}}', '{{locationPreference}}', '{{message}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nová poptávka na organizaci akce</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; margin:0; }
    .container { max-width: 640px; margin: 0 auto; background: #fff; }
    .header { background: #000; color: #fff; padding: 24px 24px; }
    .content { padding: 24px; }
    .row { margin-bottom: 8px; }
    .label { color: #555; font-weight: 600; }
    .note { background: #fff3cd; padding: 14px; border-left: 4px solid #f59e0b; border-radius: 8px; }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin:0;">Prostormat</h1>
        <p style="margin:8px 0 0 0; opacity:.9">Nová poptávka – Organizace akce</p>
      </div>
      <div class="content">
        <p class="row"><span class="label">Jméno:</span> {{name}}</p>
        <p class="row"><span class="label">E‑mail:</span> <a href="mailto:{{email}}">{{email}}</a></p>
        <p class="row"><span class="label">Telefon:</span> <a href="tel:{{phone}}">{{phone}}</a></p>
        <p class="row"><span class="label">Společnost:</span> {{company}}</p>
        <p class="row"><span class="label">Typ akce:</span> {{eventType}}</p>
        <p class="row"><span class="label">Počet hostů:</span> {{guestCount}}</p>
        <p class="row"><span class="label">Datum:</span> {{eventDate}}</p>
        <p class="row"><span class="label">Lokalita:</span> {{locationPreference}}</p>
        <p class="row"><span class="label">Rozpočet:</span> {{budgetRange}}</p>
        <div class="row" style="margin-top:12px"><span class="label">Poznámka:</span><div style="margin-top:4px; white-space:pre-wrap">{{message}}</div></div>
        <div class="note" style="margin-top:16px;">
          Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.
        </div>
      </div>
    </div>
  </body>
</html>`,
    textContent: `Nová poptávka – Organizace akce

Jméno: {{name}}
E‑mail: {{email}}
Telefon: {{phone}}
Společnost: {{company}}
Typ akce: {{eventType}}
Počet hostů: {{guestCount}}
Datum: {{eventDate}}
Lokalita: {{locationPreference}}
Rozpočet: {{budgetRange}}

Poznámka:
{{message}}

Pozn.: Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.`,
    isActive: true
  },
  {
    templateKey: 'password_reset',
    name: 'Obnova hesla',
    subject: 'Obnovení hesla – Prostormat',
    description: 'Email s odkazem na obnovení hesla',
    variables: ['{{resetLink}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; margin:0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #000; color: #fff; padding: 28px 24px; }
    .content { padding: 32px 24px; }
    .cta { display: inline-block; background: #000; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .muted { color: #555; }
    .footer { padding: 20px 24px; color: #666; background: #f7f7f7; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Prostormat</h1>
      <p style="margin:8px 0 0 0; opacity:.9">Obnovení hesla</p>
    </div>
    <div class="content">
      <p>Dobrý den,</p>
      <p>obdrželi jsme požadavek na obnovení hesla k vašemu účtu. Pokud jste o to nepožádali vy, tento e‑mail ignorujte.</p>
      <p>
        <a class="cta" href="{{resetLink}}">Obnovit heslo</a>
      </p>
      <p class="muted">Odkaz je platný 60 minut.</p>
    </div>
    <div class="footer">
      <p>Prostormat – Platforma pro hledání event prostorů</p>
      <p>Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:<br />
        <a href="{{resetLink}}">{{resetLink}}</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Obnovení hesla – Prostormat

Klikněte na odkaz pro obnovení hesla (platný 60 minut):
{{resetLink}}`,
    isActive: true
  },
  {
    templateKey: 'venue_inquiry_notification',
    name: 'Notifikace o dotazu na prostor',
    subject: 'Nový dotaz na váš prostor: {{venueName}}',
    description: 'Odesláno majiteli prostoru při novém dotazu',
    variables: ['{{venueName}}', '{{contactName}}', '{{contactEmail}}', '{{contactPhone}}', '{{message}}', '{{eventDate}}', '{{guestCount}}'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Nový dotaz na prostor</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Máte nový dotaz na váš prostor <strong>{{venueName}}</strong>.
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Kontaktní údaje:</h3>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Jméno:</strong> {{contactName}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Email:</strong> {{contactEmail}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Telefon:</strong> {{contactPhone}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Datum akce:</strong> {{eventDate}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Počet hostů:</strong> {{guestCount}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Zpráva:</strong></p>
            <p style="color: #4b5563; margin: 8px 0;">{{message}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="mailto:{{contactEmail}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Odpovědět na email
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: 'Nový dotaz na prostor {{venueName}} od {{contactName}} ({{contactEmail}})',
    isActive: true
  },
  {
    templateKey: 'venue_broadcast_notification',
    name: 'Notifikace o veřejné poptávce',
    subject: 'Nová poptávka odpovídá vašemu prostoru!',
    description: 'Odesláno majiteli prostoru při shodě s veřejnou poptávkou',
    variables: ['{{venueName}}', '{{eventType}}', '{{eventDate}}', '{{guestCount}}', '{{budgetRange}}', '{{locationPreference}}', '{{contactName}}', '{{contactEmail}}', '{{contactPhone}}', '{{description}}'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Nová poptávka pro váš prostor!</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Máme pro vás poptávku, která odpovídá vašemu prostoru <strong>{{venueName}}</strong>.
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Detaily poptávky:</h3>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Typ akce:</strong> {{eventType}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Datum:</strong> {{eventDate}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Počet hostů:</strong> {{guestCount}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Rozpočet:</strong> {{budgetRange}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Lokalita:</strong> {{locationPreference}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Popis:</strong></p>
            <p style="color: #4b5563; margin: 8px 0;">{{description}}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
            <h3 style="color: #1f2937;">Kontakt na klienta:</h3>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Jméno:</strong> {{contactName}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Email:</strong> {{contactEmail}}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Telefon:</strong> {{contactPhone}}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="mailto:{{contactEmail}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Kontaktovat klienta
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: 'Nová poptávka pro {{venueName}} od {{contactName}}',
    isActive: true
  },
  {
    templateKey: 'quick_request_venue_notification',
    name: 'Notifikace prostoru - rychlá poptávka',
    subject: '{{guestCount}} hostů - Prostormat poptávka',
    description: 'Email odeslaný majiteli prostoru při nové poptávce přes Prostormat',
    variables: ['{{venueName}}', '{{eventTitle}}', '{{guestCount}}', '{{eventDate}}', '{{eventType}}', '{{locationPreference}}', '{{detailUrl}}'],
    htmlContent: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{guestCount}} hostů - Prostormat poptávka</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .wrapper { max-width: 640px; margin: 0 auto; }
    .card { background: #ffffff; border-radius: 20px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 32px 36px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; line-height: 1.3; }
    .header p { margin: 12px 0 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 36px; }
    .intro { font-size: 17px; margin: 0 0 28px 0; color: #0f172a; }
    .details { border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background: #f8fafc; }
    .detail-row { display: flex; flex-direction: column; margin-bottom: 18px; }
    .detail-row:last-child { margin-bottom: 0; }
    .label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
    .value { font-size: 17px; font-weight: 600; color: #0f172a; }
    .note { margin: 32px 0 12px 0; font-size: 15px; color: #475569; line-height: 1.6; }
    .cta { text-align: center; margin: 28px 0 10px 0; }
    .cta a { display: inline-block; padding: 14px 32px; border-radius: 999px; background: #1d4ed8; color: #ffffff; font-weight: 600; text-decoration: none; font-size: 16px; }
    .footer { padding: 24px 36px 30px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; line-height: 1.6; }
    @media (max-width: 600px) {
      body { padding: 16px; }
      .header, .content { padding: 28px 24px; }
      .cta a { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Máte novou poptávku na váš prostor {{venueName}}</h1>
        <p>V účtu Prostormat čeká poptávka, která odpovídá vašemu prostoru.</p>
      </div>
      <div class="content">
        <p class="intro">
          Přihlaste se do administrace a zareagujte co nejdříve. Klienti obvykle vybírají z prvních odpovědí.
        </p>
        <div class="details">
          <div class="detail-row">
            <span class="label">Název akce</span>
            <span class="value">{{eventTitle}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Počet hostů</span>
            <span class="value">{{guestCount}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Datum</span>
            <span class="value">{{eventDate}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Typ akce</span>
            <span class="value">{{eventType}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Preferovaná lokalita</span>
            <span class="value">{{locationPreference}}</span>
          </div>
        </div>
        <p class="note">
          Kompletní detaily (rozpočet, požadavky, kontakt) najdete přímo ve vašem dashboardu.
        </p>
        <div class="cta">
          <a href="{{detailUrl}}">Otevřít poptávku v administraci</a>
        </div>
        <p class="note" style="margin-top: 24px;">
          Pokud nemáte aktivní členství, po přihlášení vám nabídneme nejrychlejší cestu k jeho aktivaci.
        </p>
      </div>
    </div>
    <div class="footer">
      Prostormat · Největší katalog event prostorů v Praze<br />
      prostormat.cz · info@prostromat.cz
    </div>
  </div>
</body>
</html>`,
    textContent: `Máte novou poptávku na váš prostor {{venueName}}

Název akce: {{eventTitle}}
Počet hostů: {{guestCount}}
Datum: {{eventDate}}
Typ akce: {{eventType}}
Preferovaná lokalita: {{locationPreference}}

Kompletní detaily najdete ve vašem dashboardu:
{{detailUrl}}

Zareagujte co nejdříve – klienti obvykle vybírají z prvních odpovědí.

--
Prostormat · Největší katalog event prostorů v Praze
prostormat.cz | info@prostromat.cz`,
    isActive: true
  },
]

export const emailTriggerDefinitions: EmailTriggerDefinition[] = [
  {
    triggerKey: 'user_registration',
    name: 'Registrace uživatele',
    description: 'Odesláno při registraci nového uživatele',
    templateKey: 'welcome_user',
    isEnabled: false,
  },
  {
    triggerKey: 'venue_manager_registration',
    name: 'Registrace majitele prostoru',
    description: 'Odesláno při registraci nového majitele prostoru',
    templateKey: 'welcome_location_owner',
    isEnabled: false,
  },
  {
    triggerKey: 'venue_inquiry',
    name: 'Dotaz na prostor',
    description: 'Odesláno majiteli při novém dotazu na jeho prostor',
    templateKey: 'venue_inquiry_notification',
    isEnabled: true,
  },
  {
    triggerKey: 'venue_broadcast_match',
    name: 'Shoda s veřejnou poptávkou',
    description: 'Odesláno prostorům při shodě s novou veřejnou poptávkou',
    templateKey: 'venue_broadcast_notification',
    isEnabled: true,
  },
]
