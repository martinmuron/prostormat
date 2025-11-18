import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const emailTemplates = [
  {
    templateKey: 'welcome_user',
    name: 'Vítací email pro uživatele',
    subject: 'Vítejte v Prostormatu!',
    description: 'Automaticky odesláno při registraci nového uživatele',
    variables: ['{{name}}', '{{email}}'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Vítejte v Prostormatu, {{name}}!</h1>
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
    `,
    textContent: 'Vítejte v Prostormatu, {{name}}! Jsme rádi, že jste se k nám připojili.',
    isActive: true
  },
  {
    templateKey: 'verify_email',
    name: 'Potvrzení e-mailové adresy',
    subject: 'Potvrďte svou e-mailovou adresu pro Prostormat',
    description: 'Odesláno po registraci, obsahuje odkaz pro potvrzení e-mailu',
    variables: ['{{name}}', '{{verificationLink}}'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1); border: 1px solid rgba(148, 163, 184, 0.2);">
          <h1 style="color: #0f172a; margin-bottom: 16px; font-size: 24px;">Potvrďte prosím svůj e-mail, {{name}}</h1>
          <p style="color: #334155; font-size: 16px; margin: 16px 0;">Abychom vám mohli posílat důležité informace o vašem účtu a nových poptávkách, musíme ověřit vaši e-mailovou adresu.</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="{{verificationLink}}" style="background-color: #1d4ed8; color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
              Potvrdit e-mailovou adresu
            </a>
          </div>
          <p style="color: #334155; font-size: 16px; margin: 16px 0;">Pokud tlačítko nefunguje, zkopírujte následující odkaz do adresního řádku prohlížeče:</p>
          <p style="word-break: break-word; color: #1d4ed8; font-size: 14px;">{{verificationLink}}</p>
          <p style="color: #64748b; font-size: 14px;">Pokud jste si účet na Prostormatu nevytvořil/a, tento e-mail můžete ignorovat.</p>
          <div style="color: #64748b; font-size: 14px; margin-top: 32px; text-align: center;">
            Prostormat · Největší katalog event prostorů v Praze<br />
            prostormat.cz · info@prostormat.cz
          </div>
        </div>
      </div>
    `,
    textContent: `Ahoj {{name}},

potvrď prosím svou e-mailovou adresu, aby byl tvůj účet na Prostormatu aktivní.

Potvrzení dokončíš kliknutím na tento odkaz:
{{verificationLink}}

Pokud jsi si účet nevytvořil/a, můžeš tento e-mail ignorovat.

--
Prostormat · Největší katalog event prostorů v Praze
prostormat.cz | info@prostormat.cz`,
    isActive: true
  },
  {
    templateKey: 'welcome_location_owner',
    name: 'Vítací email pro majitele prostorů',
    subject: 'Vítejte v Prostormatu - Začněte nabízet své prostory!',
    description: 'Automaticky odesláno při registraci majitele prostoru',
    variables: ['{{name}}', '{{email}}'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Vítejte v Prostormatu, {{name}}!</h1>
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
    `,
    textContent: 'Vítejte v Prostormatu, {{name}}! Začněte nabízet své prostory.',
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
  }
]

const emailTriggers = [
  {
    triggerKey: 'user_registration',
    name: 'Registrace uživatele',
    description: 'Odesláno při registraci nového běžného uživatele',
    templateKey: 'welcome_user',
    isEnabled: false
  },
  {
    triggerKey: 'user_email_verification',
    name: 'Potvrzení e-mailu uživatele',
    description: 'Odesláno uživateli po registraci s odkazem pro potvrzení e-mailu',
    templateKey: 'verify_email',
    isEnabled: true
  },
  {
    triggerKey: 'venue_manager_registration',
    name: 'Registrace majitele prostoru',
    description: 'Odesláno při registraci nového majitele prostoru',
    templateKey: 'welcome_location_owner',
    isEnabled: false
  },
  {
    triggerKey: 'venue_inquiry',
    name: 'Dotaz na prostor',
    description: 'Odesláno majiteli při novém dotazu na jeho prostor',
    templateKey: 'venue_inquiry_notification',
    isEnabled: true
  },
  {
    triggerKey: 'venue_broadcast_match',
    name: 'Shoda s veřejnou poptávkou',
    description: 'Odesláno prostorům při shodě s novou veřejnou poptávkou',
    templateKey: 'venue_broadcast_notification',
    isEnabled: true
  }
]

async function main() {
  console.log('Starting email templates seed...')

  // Seed email templates
  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { templateKey: template.templateKey },
      update: template,
      create: template,
    })
    console.log(`✓ Seeded template: ${template.name}`)
  }

  // Seed email triggers
  for (const trigger of emailTriggers) {
    await prisma.emailTrigger.upsert({
      where: { triggerKey: trigger.triggerKey },
      update: trigger,
      create: trigger,
    })
    console.log(`✓ Seeded trigger: ${trigger.name}`)
  }

  console.log('Email templates seed completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding email templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
