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

function formatInquiryDate(date: Date | string | null) {
  if (!date) return "Datum dle dohody"
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return "Datum dle dohody"
  return parsed.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatGuestCount(guestCount: number | null | undefined) {
  if (typeof guestCount === "number" && guestCount > 0) {
    return `${guestCount} hostů`
  }
  return "Počet hostů nebyl upřesněn"
}

const INQUIRY_EMAIL_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
  .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08); }
  .header { background: #000; color: #fff; padding: 32px 28px; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { padding: 32px 28px; }
  .teaser { border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; background: #f8fafc; margin-bottom: 28px; }
  .teaser h2 { margin: 0 0 12px 0; font-size: 18px; color: #0f172a; }
  .detail-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
  .detail-label { color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; }
  .detail-value { color: #111827; font-weight: 600; }
  .cta-button { display: inline-block; padding: 14px 24px; background: #000; color: #fff !important; text-decoration: none; border-radius: 12px; font-weight: 600; text-align: center; letter-spacing: 0.02em; }
  .footer { padding: 24px 28px 32px; background: #f3f4f6; color: #6b7280; font-size: 13px; text-align: center; }
  .muted-line { color: #9ca3af; font-weight: 600; letter-spacing: 0.05em; }
  .note { margin-top: 24px; padding: 16px 18px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
  .note.paid { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
  .note.unpaid { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
`

function buildInquiryEmailShell(subject: string, bodyHtml: string) {
  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>${INQUIRY_EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prostormat</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.75;">Automatické upozornění</p>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p><strong>Prostormat</strong> – Platforma pro hledání event prostorů</p>
      <p><a href="mailto:info@prostormat.cz" style="color:#111827;">info@prostormat.cz</a> · <a href="https://prostormat.cz" style="color:#111827;">prostormat.cz</a></p>
    </div>
  </div>
</body>
</html>
`
}

interface VenueInquiryEmailData {
  inquiryId: string
  venueName: string
  venueSlug: string
  eventDate: Date | string | null
  guestCount: number | null
}

export function generateVenueInquiryPaidNotificationEmail(data: VenueInquiryEmailData) {
  const subject = `Máte novou poptávku na ${data.venueName}`
  const detailUrl = `https://prostormat.cz/venue-inquiry/${encodeURIComponent(data.inquiryId)}`
  const eventDate = formatInquiryDate(data.eventDate)
  const guestCount = formatGuestCount(data.guestCount)

  const htmlBody = `
    <p style="margin:0 0 20px 0;">Dobrý den,</p>
    <p style="margin:0 0 24px 0;">obdrželi jste novou poptávku na prostor <strong>${data.venueName}</strong>. Zákazník čeká na vaši odpověď.</p>
    <div class="teaser">
      <h2>Klíčové informace</h2>
      <div class="detail-row">
        <span class="detail-label">Datum akce</span>
        <span class="detail-value">${eventDate}</span>
      </div>
      <div class="detail-row" style="margin-bottom:0;">
        <span class="detail-label">Počet hostů</span>
        <span class="detail-value">${guestCount}</span>
      </div>
    </div>
    <p style="margin:0 0 28px 0;">Kliknutím na tlačítko níže zobrazíte celou poptávku včetně kontaktních údajů zákazníka a můžete mu odpovědět.</p>
    <div style="text-align:center; margin-bottom:32px;">
      <a href="${detailUrl}" class="cta-button">Zobrazit celé znění poptávky</a>
    </div>
    <div class="note paid">
      <strong>Jste předplatitelem Prostormat.</strong><br />
      Všechny kontaktní údaje zákazníka jsou k dispozici ihned po kliknutí na tlačítko.
    </div>
  `

  const plainText = [
    `Máte novou poptávku na ${data.venueName}`,
    ``,
    `Datum akce: ${eventDate}`,
    `Počet hostů: ${guestCount}`,
    ``,
    `Zobrazit celé znění poptávky: ${detailUrl}`,
    ``,
    `Po kliknutí uvidíte kompletní kontaktní údaje a můžete zákazníka ihned kontaktovat.`,
    ``,
    `--`,
    `Prostormat`,
    `prostormat.cz`,
  ].join("\n")

  return {
    subject,
    html: buildInquiryEmailShell(subject, htmlBody),
    text: plainText,
  }
}

export function generateVenueInquiryUnpaidNotificationEmail(data: VenueInquiryEmailData) {
  const subject = `Máte novou poptávku na ${data.venueName}`
  const upgradeUrl = `https://prostormat.cz/pridat-prostor?inquiry=${encodeURIComponent(data.inquiryId)}&venue=${encodeURIComponent(data.venueSlug)}`
  const eventDate = formatInquiryDate(data.eventDate)
  const guestCount = formatGuestCount(data.guestCount)

  const htmlBody = `
    <p style="margin:0 0 20px 0;">Dobrý den,</p>
    <p style="margin:0 0 24px 0;">přišla vám nová poptávka na prostor <strong>${data.venueName}</strong>. Kontaktní údaje zákazníků jsou dostupné pouze pro předplatitele.</p>
    <div class="teaser">
      <h2>Klíčové informace</h2>
      <div class="detail-row">
        <span class="detail-label">Datum akce</span>
        <span class="detail-value">${eventDate}</span>
      </div>
      <div class="detail-row" style="margin-bottom:16px;">
        <span class="detail-label">Počet hostů</span>
        <span class="detail-value">${guestCount}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Jméno</span>
        <span class="muted-line">████████████</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="muted-line">████████████</span>
      </div>
      <div class="detail-row" style="margin-bottom:0;">
        <span class="detail-label">Telefon</span>
        <span class="muted-line">████████████</span>
      </div>
    </div>
    <p style="margin:0 0 28px 0;">Pro získání kompletních kontaktních údajů zákazníka stačí dokončit upgrade vašeho profilu.</p>
    <div style="text-align:center; margin-bottom:32px;">
      <a href="${upgradeUrl}" class="cta-button">Upgrade a zobrazení kontaktních údajů</a>
    </div>
    <div class="note unpaid">
      <strong>Vaše členství je momentálně bezplatné.</strong><br />
      Po dokončení upgradu získáte přístup ke všem poptávkám včetně kontaktů na zákazníky.
    </div>
  `

  const plainText = [
    `Máte novou poptávku na ${data.venueName}`,
    ``,
    `Datum akce: ${eventDate}`,
    `Počet hostů: ${guestCount}`,
    `Kontaktní údaje jsou dostupné po upgradu.`,
    ``,
    `Zobrazit, jak poptávka vypadá a přejít na upgrade: ${upgradeUrl}`,
    ``,
    `Po dokončení předplatného získáte všechny kontakty okamžitě.`,
    ``,
    `--`,
    `Prostormat`,
    `prostormat.cz`,
  ].join("\n")

  return {
    subject,
    html: buildInquiryEmailShell(subject, htmlBody),
    text: plainText,
  }
}

interface VenueInquiryAdminNotificationData {
  inquiryId: string
  submittedAt: Date
  venue: {
    id: string
    name: string
    slug: string
    paid: boolean
    status: string
  }
  inquiry: {
    customerName: string
    customerEmail: string
    customerPhone?: string | null
    eventDate?: Date | string | null
    guestCount?: number | null
    message?: string | null
  }
}

export function generateVenueInquiryAdminNotificationEmail(data: VenueInquiryAdminNotificationData) {
  const { inquiryId, submittedAt, venue, inquiry } = data
  const detailUrl = `https://prostormat.cz/dashboard/venue-inquiries/${inquiryId}`
  const formattedSubmitted = submittedAt.toLocaleString("cs-CZ")
  const formattedEventDate = inquiry.eventDate
    ? new Date(inquiry.eventDate).toLocaleDateString("cs-CZ")
    : "Neuvedeno"
  const membershipLabel = venue.paid ? "Placené členství" : "Bez členství"

  const subject = `Nový dotaz na prostor ${venue.name}`

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: #ffffff; border-radius: 18px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12); overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 32px 36px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 12px 0 0 0; font-size: 14px; opacity: 0.85; }
    .content { padding: 36px; }
    .section { margin-bottom: 28px; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .section h3 { margin-top: 0; font-size: 16px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
    .detail { margin-bottom: 10px; }
    .label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; }
    .badge.paid { background: #dcfce7; color: #166534; }
    .badge.unpaid { background: #fee2e2; color: #991b1b; }
    .cta { text-align: center; margin: 32px 0 0 0; }
    .cta a { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; }
    .footer { padding: 20px 36px 28px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Nový dotaz na prostor ${venue.name}</h1>
        <p>Odesláno ${formattedSubmitted}</p>
      </div>
      <div class="content">
        <div class="section">
          <h3>Prostor</h3>
          <div class="detail">
            <span class="label">Název</span>
            <span class="value">${venue.name}</span>
          </div>
          <div class="detail">
            <span class="label">Stav členství</span>
            <span class="badge ${venue.paid ? "paid" : "unpaid"}">${membershipLabel}</span>
          </div>
          <div class="detail">
            <span class="label">Stav prostoru</span>
            <span class="value">${venue.status}</span>
          </div>
        </div>

        <div class="section">
          <h3>Kontakt zákazníka</h3>
          <div class="detail">
            <span class="label">Jméno</span>
            <span class="value">${inquiry.customerName}</span>
          </div>
          <div class="detail">
            <span class="label">E-mail</span>
            <span class="value"><a href="mailto:${inquiry.customerEmail}">${inquiry.customerEmail}</a></span>
          </div>
          ${inquiry.customerPhone ? `
          <div class="detail">
            <span class="label">Telefon</span>
            <span class="value"><a href="tel:${inquiry.customerPhone}">${inquiry.customerPhone}</a></span>
          </div>` : ""}
        </div>

        <div class="section">
          <h3>Detaily akce</h3>
          <div class="detail">
            <span class="label">Datum akce</span>
            <span class="value">${formattedEventDate}</span>
          </div>
          <div class="detail">
            <span class="label">Počet hostů</span>
            <span class="value">${inquiry.guestCount ?? "Neuvedeno"}</span>
          </div>
          <div class="detail">
            <span class="label">Zpráva</span>
            <span class="value">${inquiry.message ? inquiry.message.replace(/\n/g, "<br />") : "Bez zprávy"}</span>
          </div>
        </div>

        <div class="cta">
          <a href="${detailUrl}">Otevřít celou poptávku</a>
        </div>
      </div>
      <div class="footer">
        Prostormat · Interní notifikace poptávky<br />
        Kontrolujte prosím členství provozovatele před předáním detailů klientovi.
      </div>
    </div>
  </div>
</body>
</html>
`

  const text = `
Nový dotaz na prostor ${venue.name}
Odesláno: ${formattedSubmitted}

Prostor:
- Název: ${venue.name}
- Stav členství: ${membershipLabel}
- Stav prostoru: ${venue.status}

Kontakt zákazníka:
- Jméno: ${inquiry.customerName}
- Email: ${inquiry.customerEmail}
${inquiry.customerPhone ? `- Telefon: ${inquiry.customerPhone}` : ""}

Detaily akce:
- Datum: ${formattedEventDate}
- Počet hostů: ${inquiry.guestCount ?? "Neuvedeno"}
- Zpráva: ${inquiry.message ?? "Bez zprávy"}

Plné znění poptávky: ${detailUrl}
`

  return { subject, html, text }
}



export function generateQuickRequestVenueNotificationEmail(data: QuickRequestVenueNotificationData) {
  const { venueName, venueSlug, broadcastId, quickRequest } = data
  const detailUrl = `https://prostormat.cz/poptavka/${broadcastId}?venue=${encodeURIComponent(venueSlug)}`

  const eventTitle = (quickRequest.title ?? '').trim() || 'Název akce nebyl uveden'

  let guestCountText: string | null = null
  let guestCountIsNumeric = false
  if (typeof quickRequest.guestCount === 'number' && Number.isFinite(quickRequest.guestCount)) {
    guestCountText = new Intl.NumberFormat('cs-CZ').format(quickRequest.guestCount)
    guestCountIsNumeric = true
  } else if (typeof quickRequest.guestCount === 'string') {
    const trimmed = quickRequest.guestCount.trim()
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isFinite(parsed)) {
      guestCountText = new Intl.NumberFormat('cs-CZ').format(parsed)
      guestCountIsNumeric = true
    } else {
      guestCountText = trimmed || null
    }
  }

  const subject = guestCountText
    ? `${guestCountText}${guestCountIsNumeric ? ' hostů' : ''} - Prostormat poptávka`
    : 'Nová poptávka - Prostormat'

  const eventDateText = quickRequest.eventDate
    ? new Date(quickRequest.eventDate).toLocaleDateString('cs-CZ')
    : 'Datum nebylo uvedeno'

  const locationText = (quickRequest.locationPreference ?? '').trim()
  const guestCountDisplay = guestCountText
    ? guestCountIsNumeric
      ? `${guestCountText} hostů`
      : guestCountText
    : 'Neuvedeno'

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
    .cta a {
      display: inline-block;
      padding: 14px 32px;
      border-radius: 999px;
      background: #1d4ed8;
      color: #ffffff;
      font-weight: 600;
      text-decoration: none;
      font-size: 16px;
      box-sizing: border-box;
      word-wrap: break-word;
      white-space: normal;
      text-align: center;
    }
    .footer { padding: 24px 36px 30px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; line-height: 1.6; }
    @media (max-width: 600px) {
      body { padding: 16px; }
      .header, .content { padding: 28px 24px; }
      .footer { padding: 20px 24px; }
      .cta a {
        width: 100%;
        max-width: 100%;
        padding: 12px 20px;
        font-size: 15px;
        display: block;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Máte novou poptávku na váš prostor ${venueName}</h1>
        <p>V účtu Prostormat čeká poptávka, která odpovídá vašemu prostoru.</p>
      </div>
      <div class="content">
        <p class="intro">
          Přihlaste se do administrace a zareagujte co nejdříve. Klienti obvykle vybírají z prvních odpovědí.
        </p>
        <div class="details">
          <div class="detail-row">
            <span class="label">Název akce</span>
            <span class="value">${eventTitle}</span>
          </div>
          <div class="detail-row">
            <span class="label">Počet hostů</span>
            <span class="value">${guestCountDisplay}</span>
          </div>
          <div class="detail-row">
            <span class="label">Datum</span>
            <span class="value">${eventDateText}</span>
          </div>
          ${locationText
            ? `<div class="detail-row">
            <span class="label">Preferovaná lokalita</span>
            <span class="value">${locationText}</span>
          </div>`
            : ''}
        </div>
        <p class="note">
          Kompletní detaily (požadavky, kontakt) najdete přímo ve vašem dashboardu.
        </p>
        <div class="cta">
          <a href="${detailUrl}">Otevřít poptávku v administraci</a>
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
</html>
`

  const plainText = `
Máte novou poptávku na váš prostor ${venueName}

Název akce: ${eventTitle}
Počet hostů: ${guestCountDisplay}
Datum: ${eventDateText}
${locationText ? `Preferovaná lokalita: ${locationText}\n` : ''}

Kompletní detaily najdete ve vašem dashboardu:
${detailUrl}

Zareagujte co nejdříve – klienti obvykle vybírají z prvních odpovědí.
`

  return {
    subject,
    html,
    text: plainText
  }
}


// Quick Request Venue Notification email template
interface QuickRequestVenueNotificationData {
  venueName: string
  venueSlug: string
  broadcastId: string
  quickRequest: {
    title?: string | null
    guestCount?: number | string | null
    eventDate?: Date | string | null
    locationPreference?: string | null
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
    eventDate?: string
    guestCount?: string
    locationPreference?: string
    requirements?: string
    message?: string
    contactName: string
    contactEmail: string
    contactPhone?: string
  }
  matchingVenues: QuickRequestInternalNotificationVenue[]
}

const QUICK_REQUEST_INTERNAL_GUEST_LABELS: Record<string, string> = {
  "1-25": "1-25 hostů",
  "26-50": "26-50 hostů",
  "51-100": "51-100 hostů",
  "101-200": "101-200 hostů",
  "200+": "200+ hostů",
}

export function generateQuickRequestInternalNotificationEmail(data: QuickRequestInternalNotificationData) {
  const { quickRequest, matchingVenues, broadcastId } = data
  const adminUrl = `https://prostormat.cz/admin/quick-requests?highlight=${broadcastId}`

  const matchingCount = matchingVenues.length

  // Handle both numeric and range-based guest counts
  let guestLabel: string | null = null
  if (quickRequest.guestCount) {
    // Check if it's an old range format (contains hyphen or +)
    if (quickRequest.guestCount.includes('-') || quickRequest.guestCount.includes('+')) {
      // Old range format (e.g., "26-50", "200+")
      guestLabel = QUICK_REQUEST_INTERNAL_GUEST_LABELS[quickRequest.guestCount] || quickRequest.guestCount
    } else {
      // Direct number (e.g., "40")
      const guestNum = parseInt(quickRequest.guestCount)
      if (!isNaN(guestNum) && guestNum > 0) {
        guestLabel = `${guestNum} hostů`
      }
    }
  }

  const locationLabel = quickRequest.locationPreference || null
  const subjectDetails = [guestLabel, locationLabel].filter(Boolean).join(' · ')
  const guestCountDisplay = guestLabel || 'Neuvedeno'

  const eventDateText = quickRequest.eventDate
    ? new Date(quickRequest.eventDate).toLocaleDateString('cs-CZ')
    : 'Neuvedeno'

  const subject = subjectDetails
    ? `Nová rychlá poptávka – ${subjectDetails}`
    : 'Nová rychlá poptávka'

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
      <h2 style="margin: 16px 0 8px 0; font-size: 24px;">${subjectDetails ? `Rychlá poptávka – ${subjectDetails}` : 'Rychlá poptávka'}</h2>
      <p style="margin: 0; color: #475569;">Máme novou poptávku čekající na manuální odeslání provozovatelům.</p>
    </div>

    <div class="section">
      <h3>Detaily poptávky</h3>
      <div class="detail"><span>Datum akce:</span> ${eventDateText}</div>
      <div class="detail"><span>Počet hostů:</span> ${guestCountDisplay}</div>
      <div class="detail"><span>Lokalita:</span> ${quickRequest.locationPreference || 'Neuvedeno'}</div>
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
Nová rychlá poptávka${subjectDetails ? ` – ${subjectDetails}` : ''}

Datum akce: ${eventDateText}
Počet hostů: ${guestCountDisplay}
Lokalita: ${quickRequest.locationPreference || 'Neuvedeno'}
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

interface VenueSubmissionNotificationData {
  submissionType: 'new' | 'claim' | 'priority_interest'
  companyName?: string
  locationTitle?: string
  ico?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  additionalInfo?: string
  venueName?: string
  existingVenueId?: string
  submissionId: string
}

// User registration admin notification email template
interface UserRegistrationAdminNotificationData {
  userId: string
  email: string
  name: string
  company?: string | null
  phone?: string | null
  registeredAt: Date
}

export function generateUserRegistrationAdminNotificationEmail(data: UserRegistrationAdminNotificationData) {
  const subject = `Nová registrace uživatele: ${data.email}`
  const adminUrl = `https://prostormat.cz/admin/users`
  const registeredAtFormatted = data.registeredAt.toLocaleString('cs-CZ')

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: #ffffff; border-radius: 18px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12); overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 32px 36px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 12px 0 0 0; font-size: 14px; opacity: 0.85; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; margin-bottom: 12px; background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .content { padding: 36px; }
    .section { margin-bottom: 28px; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .section:last-of-type { margin-bottom: 0; }
    .section h3 { margin-top: 0; font-size: 16px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
    .detail { margin-bottom: 10px; }
    .detail:last-of-type { margin-bottom: 0; }
    .label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .value a { color: #2563eb; text-decoration: none; }
    .value a:hover { text-decoration: underline; }
    .cta { text-align: center; margin: 32px 0 0 0; }
    .cta a { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; }
    .cta a:hover { background: #1d4ed8; }
    .footer { padding: 20px 36px 28px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="badge">✨ Nová registrace</div>
        <h1>Nový uživatel: ${data.name || data.email}</h1>
        <p>Zaregistrováno ${registeredAtFormatted}</p>
      </div>
      <div class="content">
        <div class="section">
          <h3>Informace o uživateli</h3>
          <div class="detail">
            <span class="label">ID uživatele</span>
            <span class="value">${data.userId}</span>
          </div>
          <div class="detail">
            <span class="label">E-mail</span>
            <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
          </div>
          <div class="detail">
            <span class="label">Jméno</span>
            <span class="value">${data.name || '-'}</span>
          </div>
          ${data.company ? `
          <div class="detail">
            <span class="label">Společnost</span>
            <span class="value">${data.company}</span>
          </div>
          ` : ''}
          ${data.phone ? `
          <div class="detail">
            <span class="label">Telefon</span>
            <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span>
          </div>
          ` : ''}
          <div class="detail">
            <span class="label">Datum registrace</span>
            <span class="value">${registeredAtFormatted}</span>
          </div>
        </div>

        <div class="cta">
          <a href="${adminUrl}">Zobrazit v administraci</a>
        </div>
      </div>
      <div class="footer">
        Prostormat · Automatická notifikace registrace uživatele
      </div>
    </div>
  </div>
</body>
</html>
`

  const text = `
Nová registrace uživatele

E-mail: ${data.email}
Jméno: ${data.name || '-'}
${data.company ? `Společnost: ${data.company}\n` : ''}${data.phone ? `Telefon: ${data.phone}\n` : ''}Datum registrace: ${registeredAtFormatted}
ID uživatele: ${data.userId}

Správa uživatelů: ${adminUrl}
`

  return { subject, html, text }
}

export function generateVenueSubmissionNotificationEmail(data: VenueSubmissionNotificationData) {
  const submissionTypeLabel =
    data.submissionType === 'claim' ? 'Převzetí existujícího prostoru' :
    data.submissionType === 'priority_interest' ? 'Zájem o prioritní balíček' :
    'Přidání nového prostoru'

  const subject = `Nová žádost: ${submissionTypeLabel} - ${data.contactName}`

  const adminUrl = `https://prostormat.cz/admin/venue-submissions/${data.submissionId}`

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: #ffffff; border-radius: 18px; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12); overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 32px 36px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 12px 0 0 0; font-size: 14px; opacity: 0.85; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; margin-bottom: 12px; background: rgba(255,255,255,0.15); color: #ffffff; }
    .content { padding: 36px; }
    .section { margin-bottom: 28px; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .section:last-of-type { margin-bottom: 0; }
    .section h3 { margin-top: 0; font-size: 16px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
    .detail { margin-bottom: 10px; }
    .detail:last-of-type { margin-bottom: 0; }
    .label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .value a { color: #2563eb; text-decoration: none; }
    .value a:hover { text-decoration: underline; }
    .cta { text-align: center; margin: 32px 0 0 0; }
    .cta a { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; }
    .cta a:hover { background: #1d4ed8; }
    .footer { padding: 20px 36px 28px 36px; background: #f8fafc; color: #475569; font-size: 13px; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="badge">${submissionTypeLabel}</div>
        <h1>${data.submissionType === 'claim' ? (data.locationTitle ?? data.venueName ?? 'Nová žádost') : (data.venueName ?? data.locationTitle ?? 'Nová žádost')}</h1>
        <p>Nová žádost o přidání/převzetí prostoru</p>
      </div>
      <div class="content">
        ${data.submissionType !== 'priority_interest' ? `
        <div class="section">
          <h3>Informace o prostoru</h3>
          <div class="detail">
            <span class="label">Společnost</span>
            <span class="value">${data.companyName ?? '-'}</span>
          </div>
          <div class="detail">
            <span class="label">Název prostoru</span>
            <span class="value">${data.locationTitle ?? '-'}</span>
          </div>
          <div class="detail">
            <span class="label">IČO</span>
            <span class="value">${data.ico ?? '-'}</span>
          </div>
          ${data.existingVenueId ? `
          <div class="detail">
            <span class="label">ID existujícího prostoru</span>
            <span class="value">${data.existingVenueId}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="section">
          <h3>Kontaktní údaje</h3>
          <div class="detail">
            <span class="label">Jméno</span>
            <span class="value">${data.contactName}</span>
          </div>
          <div class="detail">
            <span class="label">E-mail</span>
            <span class="value"><a href="mailto:${data.contactEmail}">${data.contactEmail}</a></span>
          </div>
          <div class="detail">
            <span class="label">Telefon</span>
            <span class="value"><a href="tel:${data.contactPhone}">${data.contactPhone}</a></span>
          </div>
        </div>

        ${data.additionalInfo ? `
        <div class="section">
          <h3>Poznámka</h3>
          <div class="detail">
            <span class="value" style="font-weight: 400;">${data.additionalInfo.replace(/\n/g, '<br>')}</span>
          </div>
        </div>
        ` : ''}

        <div class="cta">
          <a href="${adminUrl}">Otevřít v administraci</a>
        </div>
      </div>
      <div class="footer">
        Pro zpracování žádosti přejděte do administrace a ověřte poskytnuté údaje.
      </div>
    </div>
  </div>
</body>
</html>
`

  const text = `
Nová žádost: ${submissionTypeLabel}

${data.submissionType !== 'priority_interest' ? `
Informace o prostoru:
- Společnost: ${data.companyName ?? '-'}
- Název prostoru: ${data.locationTitle ?? '-'}
- IČO: ${data.ico ?? '-'}
${data.existingVenueId ? `- ID existujícího prostoru: ${data.existingVenueId}` : ''}
` : ''}

Kontaktní údaje:
- Jméno: ${data.contactName}
- Email: ${data.contactEmail}
- Telefon: ${data.contactPhone}

${data.additionalInfo ? `Poznámka:\n${data.additionalInfo}\n` : ''}

Detail žádosti: ${adminUrl}
`

  return { subject, html, text }
}

interface VenueSubmissionConfirmationData {
  contactName: string
  locationTitle?: string
  submissionType: 'new' | 'claim' | 'priority_interest'
}

export function generateVenueSubmissionConfirmationEmail(data: VenueSubmissionConfirmationData) {
  const subject = 'Děkujeme za tvou žádost na Prostormatu!'

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 16px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 0;
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo-img {
      max-width: 180px;
      height: auto;
      display: inline-block;
    }
    .email-body {
      padding: 40px 30px;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 16px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #111827;
    }
    .text-block {
      margin: 0 0 16px 0;
      color: #374151;
      line-height: 1.6;
    }
    .benefits-list {
      background: #eff6ff;
      border-radius: 8px;
      padding: 24px 28px;
      margin: 28px 0;
      border-left: 4px solid #3b82f6;
    }
    .benefits-title {
      font-size: 17px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #1e40af;
    }
    .benefit-item {
      margin: 12px 0;
      padding-left: 24px;
      position: relative;
      color: #1f2937;
      font-size: 15px;
      line-height: 1.6;
    }
    .benefit-item:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #f97316;
      font-weight: 700;
      font-size: 16px;
    }
    .closing {
      margin: 24px 0 0 0;
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
    }
    .email-footer {
      background: #f8f9fa;
      padding: 30px 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .footer-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-link:hover {
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 0;
      }
      .email-header {
        padding: 32px 20px;
      }
      .logo-img {
        max-width: 150px;
      }
      .email-body {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 17px;
      }
      .benefits-list {
        padding: 20px 20px;
        margin: 24px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <img src="https://prostormat.cz/images/logo-white.svg" alt="Prostormat" class="logo-img" />
      </div>

      <!-- Body -->
      <div class="email-body">
        <p class="greeting">Ahoj,</p>

        <p class="text-block">
          díky, že ses ozval(a) ohledně ${data.submissionType === 'claim' ? 'převzetí' : 'přidání'} profilu ${data.locationTitle ? `<strong>${data.locationTitle}</strong>` : ''} na Prostormatu.
        </p>

        <p class="text-block">
          Tvůj požadavek jsme přijali a zpracovali – ke každému prostoru přistupujeme individuálně, takže se ti ozveme do 48 hodin s dalším postupem.
        </p>

        <div class="benefits-list">
          <div class="benefits-title">Ať máš zatím dobrou náladu, tady máš pár důvodů, proč to celé vlastně dává smysl:</div>

          <div class="benefit-item">
            Lidi tě konečně najdou. A ne přes mapu, ale proto, že tě fakt hledají.
          </div>

          <div class="benefit-item">
            Rychlá poptávka přímo do mailu. Místo toho, aby tě lidi hledali na stránce 5, vyplní jeden formulář – a pokud tvůj prostor splňuje kritéria, dostaneš poptávku rovnou do emailu. Víc poptávek než teď, zaručeně.
          </div>

          <div class="benefit-item">
            Relevantní zájemci místo chaosu. Ozývají se ti, co opravdu hledají prostor, ne ti, co se jen nudí.
          </div>

          <div class="benefit-item">
            Prezentuješ se vedle špiček, ne vedle suterénů a skladů.
          </div>

          <div class="benefit-item">
            A my tě marketingově podržíme. Protože chceme, aby tvůj prostor vypadal stejně dobře, jako je.
          </div>
        </div>

        <p class="closing">
          Ozveme se co nejdřív — dík za trpělivost a za to, že chceš být součástí Prostormatu.
        </p>

        <p class="closing" style="margin-top: 12px;">
          Funguje to. Fakt.
        </p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>
          <a href="mailto:info@prostormat.cz" class="footer-link">info@prostormat.cz</a> |
          <a href="https://prostormat.cz" class="footer-link">prostormat.cz</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`

  const text = `
Ahoj,

díky, že ses ozval(a) ohledně ${data.submissionType === 'claim' ? 'převzetí' : 'přidání'} profilu ${data.locationTitle ? data.locationTitle : ''} na Prostormatu.

Tvůj požadavek jsme přijali a zpracovali – ke každému prostoru přistupujeme individuálně, takže se ti ozveme do 48 hodin s dalším postupem.

Ať máš zatím dobrou náladu, tady máš pár důvodů, proč to celé vlastně dává smysl:

✓ Lidi tě konečně najdou. A ne přes mapu, ale proto, že tě fakt hledají.

✓ Rychlá poptávka přímo do mailu. Místo toho, aby tě lidi hledali na stránce 5, vyplní jeden formulář – a pokud tvůj prostor splňuje kritéria, dostaneš poptávku rovnou do emailu. Víc poptávek než teď, zaručeně.

✓ Relevantní zájemci místo chaosu. Ozývají se ti, co opravdu hledají prostor, ne ti, co se jen nudí.

✓ Prezentuješ se vedle špiček, ne vedle suterénů a skladů.

✓ A my tě marketingově podržíme. Protože chceme, aby tvůj prostor vypadal stejně dobře, jako je.

Ozveme se co nejdřív — dík za trpělivost a za to, že chceš být součástí Prostormatu.

Funguje to. Fakt.

---
Prostormat
prostormat.cz | info@prostormat.cz
`

  return { subject, html, text }
}
