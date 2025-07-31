import { EVENT_TYPES } from '@/types'
import type { EventType } from '@/types'

interface VenueBroadcastEmailData {
  venueName: string
  venueContactEmail: string
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
  const { venueName, broadcast } = data
  const eventTypeLabel = EVENT_TYPES[broadcast.eventType as EventType] || broadcast.eventType
  
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
                    <span class="label">Verejne Poptavky:</span> ${broadcast.requirements}
                </div>
                ` : ''}
            </div>
            
            <h4 style="color: #212529; margin: 25px 0 10px 0;">Kontaktní údaje organizátora:</h4>
            <div class="detail-row">
                <span class="label">Jméno:</span> ${broadcast.contactName}
            </div>
            <div class="detail-row">
                <span class="label">Email:</span> <a href="mailto:${broadcast.contactEmail}">${broadcast.contactEmail}</a>
            </div>
            ${broadcast.contactPhone ? `
            <div class="detail-row">
                <span class="label">Telefon:</span> <a href="tel:${broadcast.contactPhone}">${broadcast.contactPhone}</a>
            </div>
            ` : ''}
            
            <p style="margin: 30px 0 20px 0;">
                <strong>Máte zájem o tuto akci?</strong> Kontaktujte organizátora přímo na uvedených kontaktech nebo se přihlaste do systému Prostormat pro správu vašich poptávek.
            </p>
            
            <a href="https://prostormat-production.up.railway.app/dashboard" class="cta-button">
                Přihlásit se do Prostormatu
            </a>
        </div>
        
        <div class="footer">
            <p><strong>Prostormat</strong> - Platforma pro hledání event prostorů</p>
            <p>Tento email jste obdrželi, protože váš prostor byl automaticky vybrán na základě kritérií poptávky.</p>
            <p>
                <a href="mailto:info@prostormat.cz" style="color: #007bff;">info@prostormat.cz</a> | 
                <a href="https://prostormat-production.up.railway.app" style="color: #007bff;">prostormat.cz</a>
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
${broadcast.requirements ? `- Verejne Poptavky: ${broadcast.requirements}` : ''}

Kontaktní údaje organizátora:
- Jméno: ${broadcast.contactName}
- Email: ${broadcast.contactEmail}
${broadcast.contactPhone ? `- Telefon: ${broadcast.contactPhone}` : ''}

Máte zájem o tuto akci? Kontaktujte organizátora přímo na uvedených kontaktech.

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