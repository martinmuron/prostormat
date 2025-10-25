import { EVENT_TYPES } from '@/types'
import type { EventType } from '@/types'

interface VenueBroadcastEmailData {
  venueName: string
  venueContactEmail: string
  venueSlug: string
  broadcastId: string
  broadcast: {
    title: string
    description: string
    eventType: string
    eventDate?: Date | null
    guestCount?: number | null
    budgetRange?: string
    locationPreference?: string
    requirements?: string
    contactName: string
    contactEmail: string
    contactPhone?: string
  }
}

export function generateVenueBroadcastEmail(data: VenueBroadcastEmailData) {
  const { venueName, venueSlug, broadcastId, broadcast } = data
  const eventTypeLabel = EVENT_TYPES[broadcast.eventType as EventType] || broadcast.eventType
  const viewDetailsUrl = `https://prostormat.cz/poptavka/${broadcastId}?venue=${venueSlug}`

  const subject = `Nová poptávka akce: ${broadcast.title}`
  
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
            
            <p>máme pro vás novou poptávku akce, která by mohla odpovídat vašemu prostoru <strong>${venueName}</strong>.</p>
            
            <div class="highlight">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">${broadcast.title}</h3>
                <p style="margin: 0; color: #424242;">${broadcast.description}</p>
            </div>
            
            <div class="event-details">
                <h4 style="margin: 0 0 15px 0; color: #212529;">Detaily akce:</h4>
                
                <div class="detail-row">
                    <span class="label">Typ akce:</span> ${eventTypeLabel}
                </div>
                
                ${broadcast.eventDate ? `
                <div class="detail-row">
                    <span class="label">Datum akce:</span> ${new Date(broadcast.eventDate).toLocaleDateString('cs-CZ')}
                </div>
                ` : ''}
                
                ${broadcast.guestCount ? `
                <div class="detail-row">
                    <span class="label">Počet hostů:</span> ${broadcast.guestCount}
                </div>
                ` : ''}
                
                ${broadcast.budgetRange ? `
                <div class="detail-row">
                    <span class="label">Rozpočet:</span> ${broadcast.budgetRange}
                </div>
                ` : ''}
                
                ${broadcast.locationPreference ? `
                <div class="detail-row">
                    <span class="label">Lokalita:</span> ${broadcast.locationPreference}
                </div>
                ` : ''}
                
                ${broadcast.requirements ? `
                <div class="detail-row">
                    <span class="label">Požadavky:</span> ${broadcast.requirements}
                </div>
                ` : ''}
            </div>

            <p style="margin: 30px 0 20px 0;">
                <strong>Máte zájem o tuto akci?</strong> Klikněte na tlačítko níže pro zobrazení kontaktních údajů organizátora.
            </p>

            <a href="${viewDetailsUrl}" class="cta-button">
                Zobrazit plné detaily
            </a>
        </div>
        
        <div class="footer">
            <p><strong>Prostormat</strong> - Platforma pro hledání event prostorů</p>
            <p>Tento email jste obdrželi, protože váš prostor byl automaticky vybrán na základě kritérií poptávky.</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | 
                <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`

  const plainText = `
Nová poptávka akce přes Prostormat

Dobrý den,

máme pro vás novou poptávku akce pro váš prostor ${venueName}.

${broadcast.title}
${broadcast.description}

Detaily akce:
- Typ akce: ${eventTypeLabel}
${broadcast.eventDate ? `- Datum akce: ${new Date(broadcast.eventDate).toLocaleDateString('cs-CZ')}` : ''}
${broadcast.guestCount ? `- Počet hostů: ${broadcast.guestCount}` : ''}
${broadcast.budgetRange ? `- Rozpočet: ${broadcast.budgetRange}` : ''}
${broadcast.locationPreference ? `- Lokalita: ${broadcast.locationPreference}` : ''}
${broadcast.requirements ? `- Požadavky: ${broadcast.requirements}` : ''}

Máte zájem o tuto akci? Zobrazit plné detaily (včetně kontaktních údajů):
${viewDetailsUrl}

--
Prostormat - Platforma pro hledání event prostorů
prostormat.cz | info@prostormat.cz
`

  return {
    subject,
    html,
    text: plainText
  }
}

// Password reset email template
export function generatePasswordResetEmail(resetLink: string) {
  const subject = `Obnovení hesla – Prostormat`
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
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
        <a class="cta" href="${resetLink}">Obnovit heslo</a>
      </p>
      <p class="muted">Odkaz je platný 60 minut.</p>
    </div>
    <div class="footer">
      <p>Prostormat – Platforma pro hledání event prostorů</p>
      <p>Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:<br />
        <a href="${resetLink}">${resetLink}</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const text = `Obnovení hesla – Prostormat\n\nKlikněte na odkaz pro obnovení hesla (platný 60 minut):\n${resetLink}`

  return { subject, html, text }
}


export function generateQuickRequestVenueNotificationEmail(data: QuickRequestVenueNotificationData) {
  const { venueName, venueSlug, broadcastId, quickRequest } = data
  const eventTypeLabel = EVENT_TYPES[quickRequest.eventType as EventType] || quickRequest.eventType
  const detailUrl = `https://prostormat.cz/poptavka/${broadcastId}?venue=${encodeURIComponent(venueSlug)}`

  const subject = `Nová poptávka čeká ve vašem účtu – ${venueName}`

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px 36px; color: #fff; }
    .header h1 { margin: 0; font-size: 26px; line-height: 1.2; }
    .header p { margin: 12px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 36px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; background: #f0f9ff; color: #0369a1; font-weight: 600; font-size: 13px; margin-bottom: 20px; }
    .highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; margin: 24px 0 32px 0; }
    .cta { text-align: center; margin: 30px 0 10px 0; }
    .cta a { display: inline-block; padding: 14px 28px; background: #0ea5e9; color: #fff; border-radius: 999px; font-weight: 600; font-size: 16px; text-decoration: none; }
    .footer { padding: 24px 36px 32px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nová poptávka je připravena</h1>
      <p>V účtu Prostormat máte novou rychlou poptávku k prostoru <strong>${venueName}</strong>.</p>
    </div>
    <div class="content">
      <span class="badge">Rychlá poptávka · ${eventTypeLabel}</span>

      <div class="highlight">
        <p style="margin: 0; font-size: 16px; color: #1e293b;">
          Kompletní detail je dostupný pouze v administraci Prostormatu. Po přihlášení si prosím poptávku pročtěte a odpovězte klientovi co nejdříve.
        </p>
      </div>

      <div class="cta">
        <a href="${detailUrl}">Otevřít poptávku v administraci</a>
      </div>

      <p style="margin: 28px 0 0 0; font-size: 15px; color: #475569;">
        Pokud nemáte aktivní roční členství, po přihlášení vám nabídneme nejrychlejší cestu k jeho aktivaci. Aktivní členové mají přístup ke všem detailům i kontaktům.
      </p>
    </div>
    <div class="footer">
      Prostormat · Největší katalog event prostorů v Praze<br />
      prostormat.cz · info@prostromat.cz
    </div>
  </div>
</body>
</html>
`

  const plainText = `
Nová rychlá poptávka je ve vašem účtu Prostormat.

Prostor: ${venueName}
Typ akce: ${eventTypeLabel}

Detail naleznete pouze po přihlášení:
${detailUrl}

Pokud nemáte aktivní členství, nabídneme vám jeho aktivaci po přihlášení.
`

  return {
    subject,
    html,
    text: plainText
  }
}
// Welcome email template for normal users
interface WelcomeUserData {
  name: string
  email: string
}

export function generateWelcomeEmailForUser(data: WelcomeUserData) {
  const { name } = data
  const subject = `Vítejte v Prostormatu, ${name}!`
  
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .highlight { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .feature-list li:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Vítejte na platformě pro hledání event prostorů</p>
        </div>
        
        <div class="content">
            <h2 style="color: #212529; margin-bottom: 20px;">Ahoj ${name}! 👋</h2>
            
            <p>Děkujeme, že jste se zaregistrovali do Prostormatu – vaší nové platformy pro hledání dokonalých event prostorů v České republice.</p>
            
            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #000;">Co vás čeká:</h3>
                <ul class="feature-list">
                    <li>🔍 <strong>Rychlé vyhledávání</strong> – Najděte ideální prostor pro váš event</li>
                    <li>💬 <strong>Přímá komunikace</strong> – Kontaktujte majitele prostorů přímo</li>
                    <li>📊 <strong>Srovnání nabídek</strong> – Porovnejte ceny a vybavení</li>
                    <li>⭐ <strong>Ověřené recenze</strong> – Čtěte zkušenosti ostatních</li>
                    <li>📅 <strong>Snadné rezervace</strong> – Rezervujte prostor v několika krocích</li>
                </ul>
            </div>
            
            <p>Připravili jsme pro vás intuitivní prostředí, kde snadno najdete prostor pro:</p>
            <ul>
                <li>Firemní akce a teambuildingy</li>
                <li>Konference a školení</li>
                <li>Oslavy a večírky</li>
                <li>Workshopy a prezentace</li>
                <li>A mnoho dalších událostí</li>
            </ul>
            
            <p style="margin: 30px 0 20px 0;">
                <strong>Začněte hned teď</strong> a objevte stovky prostorů po celé České republice:
            </p>
            
            <a href="https://prostormat.cz/prostory" class="cta-button">
                Prohlédnout prostory
            </a>
            
            <p style="margin-top: 30px;">
                Máte otázky? Neváhejte nás kontaktovat na <a href="mailto:info@prostormat.cz" style="color: #000;">info@prostormat.cz</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Prostormat</strong> – Platforma pro hledání event prostorů</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | 
                <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`

  const text = `
Vítejte v Prostormatu, ${name}!

Děkujeme, že jste se zaregistrovali do Prostormatu – vaší nové platformy pro hledání dokonalých event prostorů v České republice.

Co vás čeká:
- Rychlé vyhledávání ideálních prostorů
- Přímá komunikace s majiteli
- Srovnání nabídek a cen
- Ověřené recenze od uživatelů
- Snadné rezervace

Začněte hned teď na: https://prostormat.cz/prostory

Máte otázky? Kontaktujte nás na info@prostormat.cz

--
Prostormat – Platforma pro hledání event prostorů
prostormat.cz | info@prostormat.cz
`

  return { subject, html, text }
}

// Welcome email template for location owners
interface WelcomeLocationOwnerData {
  name: string
  email: string
}

export function generateWelcomeEmailForLocationOwner(data: WelcomeLocationOwnerData) {
  const { name } = data
  const subject = `Vítejte v Prostormatu, ${name}! Začněte nabízet své prostory`
  
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #000; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .secondary-button { display: inline-block; background: #f8f9fa; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 10px 10px 0; border: 2px solid #000; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .feature-item { background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .step-list { counter-reset: step-counter; list-style: none; padding: 0; }
        .step-list li { counter-increment: step-counter; padding: 15px 0; border-bottom: 1px solid #eee; position: relative; padding-left: 50px; }
        .step-list li:last-child { border-bottom: none; }
        .step-list li::before { content: counter(step-counter); position: absolute; left: 0; top: 15px; background: #000; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Prostormat</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Začněte vydělávat se svými prostory</p>
        </div>
        
        <div class="content">
            <h2 style="color: #212529; margin-bottom: 20px;">Vítejte ${name}! 🏢</h2>
            
            <p>Gratulujeme k registraci jako majitel prostorů na Prostormatu! Připojili jste se k síti úspěšných majitelů, kteří vydělávají pronájmem svých prostorů pro eventy.</p>
            
            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">💰 Začněte vydělávat už dnes!</h3>
                <p style="margin: 0;">Díky naší platformě můžete zvýšit využití vašich prostorů až o 300% a generovat stabilní pasivní příjem.</p>
            </div>
            
            <h3 style="color: #212529; margin: 30px 0 20px 0;">Jak začít:</h3>
            <ol class="step-list">
                <li><strong>Přidejte svůj prostor</strong><br>Vytvořte atraktivní profil s fotkami a detailním popisem</li>
                <li><strong>Nastavte ceny</strong><br>Určete si vlastní cenník a dostupnost</li>
                <li><strong>Přijímejte rezervace</strong><br>Komunikujte s klienty a potvrzujte rezervace</li>
                <li><strong>Vydělávejte</strong><br>Získávejte platby za každou úspěšnou rezervaci</li>
            </ol>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #212529; margin-bottom: 15px;">Proč majitelé prostorů milují Prostormat:</h3>
                <div class="feature-grid">
                    <div class="feature-item">
                        <strong>📈 Více rezervací</strong><br>
                        Vyšší viditelnost = více klientů
                    </div>
                    <div class="feature-item">
                        <strong>💻 Snadná správa</strong><br>
                        Vše pod kontrolou v jednom místě
                    </div>
                    <div class="feature-item">
                        <strong>🛡️ Bezpečné platby</strong><br>
                        Garantované a rychlé platby
                    </div>
                    <div class="feature-item">
                        <strong>⭐ Ověření klientů</strong><br>
                        Kvalitní a spolehliví nájemci
                    </div>
                </div>
            </div>
            
            <p style="margin: 30px 0 20px 0;">
                <strong>Připraveni začít?</strong> Přidejte svůj první prostor a začněte přijímat rezervace:
            </p>
            
            <a href="https://prostormat.cz/pridat-prostor" class="cta-button">
                Přidat prostor
            </a>
            <a href="https://prostormat.cz/dashboard" class="secondary-button">
                Dashboard
            </a>
            
            <p style="margin-top: 30px;">
                <strong>Potřebujete pomoct?</strong> Náš tým je tu pro vás:<br>
                📧 <a href="mailto:info@prostormat.cz" style="color: #000;">info@prostormat.cz</a><br>
                💬 Živý chat na našem webu
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Prostormat</strong> – Platforma pro pronájem event prostorů</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | 
                <a href="https://prostormat.cz" style="color: #007bff;">prostormat.cz</a>
            </p>
        </div>
    </div>
</body>
</html>`

  const text = `
Vítejte v Prostormatu, ${name}!

Gratulujeme k registraci jako majitel prostorů na Prostormatu! Připojili jste se k síti úspěšných majitelů, kteří vydělávají pronájmem svých prostorů pro eventy.

Jak začít:
1. Přidejte svůj prostor - Vytvořte atraktivní profil s fotkami
2. Nastavte ceny - Určete si vlastní cenník a dostupnost  
3. Přijímejte rezervace - Komunikujte s klienty
4. Vydělávejte - Získávejte platby za každou rezervaci

Proč majitelé prostorů milují Prostormat:
- Více rezervací díky vyšší viditelnosti
- Snadná správa v jednom místě
- Bezpečné a rychlé platby
- Ověření a kvalitní klienti

Začněte hned: https://prostormat.cz/pridat-prostor

Potřebujete pomoct? Kontaktujte nás na info@prostormat.cz

--
Prostormat – Platforma pro pronájem event prostorů  
prostormat.cz | info@prostormat.cz
`

  return { subject, html, text }
}

// Contact form thank you email template
interface ContactFormThankYouData {
  name: string
  email: string
  subject: string
  message: string
}

export function generateContactFormThankYouEmail(data: ContactFormThankYouData) {
  const { name } = data
  const subject = `Děkujeme za vaši zprávu, ${name}!`
  
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
            <h2 style="color: #212529; margin-bottom: 20px;">Ahoj ${name}! 👋</h2>
            
            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">✅ Vaše zpráva byla úspěšně odeslána!</h3>
                <p style="margin: 0;">Děkujeme, že jste nás kontaktovali. Vaši zprávu jsme obdrželi a brzy se vám ozveme.</p>
            </div>
            
            <p>Potvrzujeme, že jsme obdrželi vaši zprávu týkající se: <strong>"${data.subject}"</strong></p>
            
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
                <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">Pracovní doba: Pondělí-Pátek 9:00-18:00</p>
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
</html>`

  const text = `
Děkujeme za vaši zprávu, ${name}!

Vaše zpráva byla úspěšně odeslána!

Potvrzujeme, že jsme obdrželi vaši zprávu týkající se: "${data.subject}"

DOBA ODEZVY:
Odpovíme vám do 24 hodin během pracovních dnů (pondělí-pátek).

Mezitím můžete:
- Prohlédnout si naše prostory na: https://prostormat.cz/prostory
- Přečíst si FAQ na: https://prostormat.cz/faq
- Sledovat náš blog pro tipy a trendy

Potřebujete okamžitou pomoc?
Email: info@prostormat.cz
Telefon: +420 775 654 639
Pracovní doba: Pondělí-Pátek 9:00-18:00

--
Prostormat – Platforma pro hledání event prostorů
Tento email je automatická odpověď na vaši zprávu.
prostormat.cz | info@prostormat.cz
`

  return { subject, html, text }
}

// Organize Event thank you email template
interface OrganizeEventThankYouData {
  name: string
  eventType?: string
  guestCount?: number
  eventDate?: Date | null
}

export function generateOrganizeEventThankYouEmail(data: OrganizeEventThankYouData) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://prostormat-future-developments.vercel.app'
  const subject = `Děkujeme – postaráme se o vaši akci`
  const dateStr = data.eventDate ? new Date(data.eventDate).toLocaleDateString('cs-CZ') : null
  const details = [
    data.eventType ? `Typ akce: ${data.eventType}` : null,
    typeof data.guestCount === 'number' ? `Počet hostů: ${data.guestCount}` : null,
    dateStr ? `Datum: ${dateStr}` : null,
  ].filter(Boolean).join(' • ')

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
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
      <p>Ahoj ${data.name} 👋</p>
      <p>Děkujeme za váš zájem – náš tým se vám brzy ozve s návrhem prostorů a kompletní organizací akce.</p>
      ${details ? `<p class="muted" style="margin: 12px 0 0 0">${details}</p>` : ''}
      <div class="note" style="margin: 20px 0;">
        <strong>Vzhledem k vysoké poptávce</strong> aktuálně přijímáme pouze akce pro <strong>30+ osob</strong>.
      </div>
      <p>Mezitím si můžete prohlédnout vybrané prostory:</p>
      <p>
        <a class="cta" href="${baseUrl}/prostory">Prohlédnout prostory</a>
      </p>
      <p class="muted">Pokud máte doplňující informace, stačí odpovědět na tento e‑mail.</p>
    </div>
    <div class="footer">
      <p>Prostormat – Platforma pro hledání event prostorů</p>
      <p>info@prostormat.cz • prostormat.cz</p>
    </div>
  </div>
  </body>
  </html>`

  const text = `Děkujeme – postaráme se o vaši akci

Ahoj ${data.name},
děkujeme za váš zájem – brzy se vám ozveme s návrhem prostorů a kompletní organizací akce.
${details ? `\n${details}\n` : ''}
Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.

Prostory: ${baseUrl}/prostory

Prostormat – Platforma pro hledání event prostorů`

  return { subject, html, text }
}

// Organize Event admin notification email
interface OrganizeEventAdminData {
  name: string
  email: string
  phone?: string
  company?: string
  eventType?: string
  guestCount?: number
  eventDate?: Date | null
  budgetRange?: string
  locationPreference?: string
  message?: string
}

export function generateOrganizeEventAdminNotification(data: OrganizeEventAdminData) {
  const subject = `Nová poptávka na organizaci akce${
    data.guestCount ? ` (${data.guestCount} osob)` : ''
  }`
  const dateStr = data.eventDate ? new Date(data.eventDate).toLocaleDateString('cs-CZ') : 'Neuvedeno'
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
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
        <p class="row"><span class="label">Jméno:</span> ${data.name}</p>
        <p class="row"><span class="label">E‑mail:</span> <a href="mailto:${data.email}">${data.email}</a></p>
        ${data.phone ? `<p class="row"><span class="label">Telefon:</span> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
        ${data.company ? `<p class="row"><span class="label">Společnost:</span> ${data.company}</p>` : ''}
        ${data.eventType ? `<p class="row"><span class="label">Typ akce:</span> ${data.eventType}</p>` : ''}
        ${typeof data.guestCount === 'number' ? `<p class="row"><span class="label">Počet hostů:</span> ${data.guestCount}</p>` : ''}
        <p class="row"><span class="label">Datum:</span> ${dateStr}</p>
        ${data.locationPreference ? `<p class="row"><span class="label">Lokalita:</span> ${data.locationPreference}</p>` : ''}
        ${data.budgetRange ? `<p class="row"><span class="label">Rozpočet:</span> ${data.budgetRange}</p>` : ''}
        ${data.message ? `<div class="row" style="margin-top:12px"><span class="label">Poznámka:</span><div style="margin-top:4px; white-space:pre-wrap">${data.message}</div></div>` : ''}
        <div class="note" style="margin-top:16px;">
          Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.
        </div>
      </div>
    </div>
  </body>
</html>`

  const text = `Nová poptávka – Organizace akce

Jméno: ${data.name}
E‑mail: ${data.email}
${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.company ? `Společnost: ${data.company}\n` : ''}${data.eventType ? `Typ akce: ${data.eventType}\n` : ''}${typeof data.guestCount === 'number' ? `Počet hostů: ${data.guestCount}\n` : ''}Datum: ${dateStr}
${data.locationPreference ? `Lokalita: ${data.locationPreference}\n` : ''}${data.budgetRange ? `Rozpočet: ${data.budgetRange}\n` : ''}${data.message ? `\nPoznámka:\n${data.message}\n` : ''}

Pozn.: Vzhledem k vysoké poptávce aktuálně přijímáme pouze akce pro 30+ osob.`

  return { subject, html, text }
}

// Add Venue (Pridat Prostor) Thank You email template
interface AddVenueThankYouData {
  name: string
  email: string
  venueName?: string
  venueType?: string
}

export function generateAddVenueThankYouEmail(data: AddVenueThankYouData) {
  const { name, venueName } = data
  const subject = `Děkujeme za přidání prostoru, ${name}!`
  
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
            <h2 style="color: #212529; margin-bottom: 20px;">Ahoj ${name}! 🎉</h2>
            
            <div class="highlight">
                <h3 style="margin: 0 0 15px 0; color: #16a34a;">✅ Váš prostor byl úspěšně přidán!</h3>
                <p style="margin: 0;">Děkujeme, že jste přidali ${venueName ? `"${venueName}"` : 'svůj prostor'} do naší platformy. Váš prostor je nyní v procesu schvalování.</p>
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
</html>`

  const text = `
Děkujeme za přidání prostoru, ${name}!

Váš prostor byl úspěšně přidán!

Děkujeme, že jste přidali ${venueName ? `"${venueName}"` : 'svůj prostor'} do naší platformy. Váš prostor je nyní v procesu schvalování.

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
prostormat.cz | info@prostormat.cz
`

  return { subject, html, text }
}

// Quick Request Venue Notification email template
interface QuickRequestVenueNotificationData {
  venueName: string
  venueSlug: string
  broadcastId: string
  quickRequest: {
    eventType: string
  }
}



interface QuickRequestInternalNotificationVenue {
  name: string
  district?: string | null
  capacityStanding?: number | null
  capacitySeated?: number | null
}

interface QuickRequestInternalNotificationData {
  broadcastId: string
  quickRequest: {
    eventType: string
    eventDate?: string
    guestCount?: string
    budgetRange?: string
    locationPreference?: string
    requirements?: string
    message?: string
    contactName: string
    contactEmail: string
    contactPhone?: string
  }
  matchingVenues: QuickRequestInternalNotificationVenue[]
}

export function generateQuickRequestInternalNotificationEmail(data: QuickRequestInternalNotificationData) {
  const { quickRequest, matchingVenues, broadcastId } = data
  const eventTypeLabel = EVENT_TYPES[quickRequest.eventType as EventType] || quickRequest.eventType
  const adminUrl = `https://prostormat.cz/admin/quick-requests?highlight=${broadcastId}`

  const matchingCount = matchingVenues.length

  const eventDateText = quickRequest.eventDate
    ? new Date(quickRequest.eventDate).toLocaleDateString('cs-CZ')
    : 'Neuvedeno'

  const subject = `Nová rychlá poptávka – ${eventTypeLabel}`

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; color: #212529; line-height: 1.6; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08); }
    .header { margin-bottom: 24px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: #eefff4; color: #0f5132; font-weight: 600; font-size: 13px; }
    .section { margin: 24px 0; padding: 20px; border-radius: 14px; border: 1px solid #e9ecef; background: #fdfdfe; }
    .section h3 { margin: 0 0 12px 0; font-size: 16px; color: #0f172a; }
    .detail { margin: 6px 0; }
    .detail span { display: inline-block; min-width: 140px; color: #475569; font-weight: 600; }
    .cta { margin-top: 28px; text-align: center; }
    .cta a { display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none; }
    ul { padding-left: 20px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">⚡ Rychlá poptávka</div>
      <h2 style="margin: 16px 0 8px 0; font-size: 24px;">${eventTypeLabel}</h2>
      <p style="margin: 0; color: #475569;">Máme novou poptávku čekající na manuální odeslání provozovatelům.</p>
    </div>

    <div class="section">
      <h3>Detaily poptávky</h3>
      <div class="detail"><span>Datum akce:</span> ${eventDateText}</div>
      <div class="detail"><span>Počet hostů:</span> ${quickRequest.guestCount || 'Neuvedeno'}</div>
      <div class="detail"><span>Lokalita:</span> ${quickRequest.locationPreference || 'Neuvedeno'}</div>
      <div class="detail"><span>Rozpočet:</span> ${quickRequest.budgetRange || 'Neuvedeno'}</div>
      ${quickRequest.requirements ? `<div class="detail"><span>Požadavky:</span> ${quickRequest.requirements}</div>` : ''}
      ${quickRequest.message ? `<div class="detail"><span>Zpráva:</span> ${quickRequest.message}</div>` : ''}
    </div>

    <div class="section">
      <h3>Kontakt</h3>
      <div class="detail"><span>Jméno:</span> ${quickRequest.contactName}</div>
      <div class="detail"><span>Email:</span> <a href="mailto:${quickRequest.contactEmail}">${quickRequest.contactEmail}</a></div>
      <div class="detail"><span>Telefon:</span> ${quickRequest.contactPhone || 'Neuvedeno'}</div>
    </div>

    <div class="cta">
      <a href="${adminUrl}">Otevřít v administraci</a>
    </div>

    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
      Celkem nalezeno <strong>${matchingCount}</strong> vhodných prostorů. Kompletní seznam najdete po otevření poptávky v administraci.
    </p>
    <p style="margin-top: 12px; color: #64748b; font-size: 14px;">Po zkontrolování poptávky prosím odešlete emaily ručně pomocí tlačítka „Odeslat“ u jednotlivých prostorů nebo „Odeslat všem“.</p>
  </div>
`

  const text = `
Nová rychlá poptávka – ${eventTypeLabel}

Datum akce: ${eventDateText}
Počet hostů: ${quickRequest.guestCount || 'Neuvedeno'}
Lokalita: ${quickRequest.locationPreference || 'Neuvedeno'}
Rozpočet: ${quickRequest.budgetRange || 'Neuvedeno'}
Požadavky: ${quickRequest.requirements || '-'}
Zpráva: ${quickRequest.message || '-'}

Kontakt:
- Jméno: ${quickRequest.contactName}
- Email: ${quickRequest.contactEmail}
- Telefon: ${quickRequest.contactPhone || 'Neuvedeno'}

Vyhovující prostory: ${matchingCount}
Detail správy: ${adminUrl}
`

  return { subject, html, text }
}
