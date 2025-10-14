import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding contact_form_admin email template...\n')

  const contactFormAdminTemplate = await prisma.emailTemplate.upsert({
    where: { templateKey: 'contact_form_admin' },
    update: {
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
      isActive: true,
      updatedAt: new Date()
    },
    create: {
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
    }
  })

  console.log(`✅ Seeded template: ${contactFormAdminTemplate.name}`)
  console.log('\n✨ Contact form admin template seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding contact_form_admin template:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
