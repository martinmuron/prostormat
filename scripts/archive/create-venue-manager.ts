/**
 * Create Venue Manager and Assign to Venue
 *
 * Usage:
 * npx tsx scripts/create-venue-manager.ts
 *
 * Then follow the prompts to create a venue manager account
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as readline from 'readline'

// Load production environment
const envPath = path.join(process.cwd(), '.env.production')
dotenv.config({ path: envPath })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createVenueManager() {
  const { db } = await import('@/lib/db')
  const bcrypt = await import('bcryptjs')
  const { resend } = await import('@/lib/resend')

  console.log('='.repeat(60))
  console.log('CREATE VENUE MANAGER')
  console.log('='.repeat(60))
  console.log()

  // Get user input
  const email = await question('Email address: ')
  const name = await question('Full name: ')
  const password = await question('Password (min 8 characters): ')

  if (!email || !name || !password || password.length < 8) {
    console.error('❌ All fields required, password must be at least 8 characters')
    rl.close()
    return
  }

  // Get venue slug
  const venueSlug = await question('Venue slug (leave empty to skip): ')

  console.log()
  console.log('Creating venue manager...')

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists (ID: ${existingUser.id})`)
      rl.close()
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'venue_manager',
      }
    })

    console.log(`✅ User created: ${user.email} (ID: ${user.id})`)

    // Find and assign venue if slug provided
    let venue = null
    if (venueSlug) {
      venue = await db.venue.findUnique({
        where: { slug: venueSlug }
      })

      if (!venue) {
        console.log(`⚠️  Venue with slug "${venueSlug}" not found. User created but not assigned to venue.`)
      } else {
        await db.venue.update({
          where: { id: venue.id },
          data: { managerId: user.id }
        })
        console.log(`✅ User assigned to venue: ${venue.name}`)
      }
    }

    // Send email with credentials
    console.log()
    console.log('Sending welcome email...')

    await resend.emails.send({
      from: 'Prostormat <noreply@prostormat.cz>',
      to: email,
      replyTo: 'info@prostormat.cz',
      subject: 'Váš účet správce prostoru na Prostormat.cz',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Vítejte na Prostormat! 🎉</h1>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Ahoj ${name},
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Byl vám vytvořen účet správce prostoru na <strong>Prostormat.cz</strong>.
                ${venue ? `Nyní máte přístup ke správě prostoru <strong>${venue.name}</strong>.` : 'Nyní máte přístup k administraci vašich prostor.'}
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Vaše přihlašovací údaje:</h2>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                <p style="color: #4b5563; font-size: 16px; margin: 8px 0;"><strong>Heslo:</strong> ${password}</p>
                <p style="color: #dc2626; font-size: 14px; margin: 12px 0 0 0;">
                  ⚠️ Doporučujeme po prvním přihlášení změnit heslo ve vašem profilu.
                </p>
              </div>

              <div style="margin: 24px 0;">
                <a href="https://prostormat.cz/prihlaseni"
                   style="display: block; background-color: #3b82f6; color: white !important; padding: 14px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
                  🔐 Přihlásit se nyní
                </a>
              </div>

              ${venue ? `
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Po přihlášení budete přesměrováni do administrace, kde můžete:
              </p>
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                <li>Upravovat informace o prostoru</li>
                <li>Nahrávat nové fotografie a videa</li>
                <li>Spravovat rezervace a dotazy</li>
                <li>Sledovat statistiky návštěvnosti</li>
              </ul>
              <div style="margin: 24px 0;">
                <a href="https://prostormat.cz/prostory/${venue.slug}"
                   style="display: inline-block; background-color: white; color: #3b82f6; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 2px solid #3b82f6;">
                  📍 Zobrazit váš prostor
                </a>
              </div>
              ` : ''}

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Pokud máte jakékoliv dotazy nebo potřebujete pomoc, neváhejte nás kontaktovat na
                <a href="mailto:info@prostormat.cz" style="color: #3b82f6;">info@prostormat.cz</a>
              </p>

              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>S pozdravem,</strong><br>
                  Tým Prostormat<br>
                  <a href="https://prostormat.cz" style="color: #3b82f6;">prostormat.cz</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })

    // Log email send
    await db.emailFlowLog.create({
      data: {
        emailType: 'venue_manager_created',
        recipient: email,
        status: 'sent',
        metadata: {
          userId: user.id,
          venueId: venue?.id,
          venueName: venue?.name,
        }
      }
    })

    console.log(`✅ Welcome email sent to ${email}`)
    console.log()
    console.log('='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ User: ${user.email}`)
    console.log(`✅ Role: venue_manager`)
    if (venue) {
      console.log(`✅ Venue: ${venue.name} (${venue.slug})`)
    }
    console.log(`✅ Email sent with login credentials`)
    console.log()
    console.log('The customer can now log in at: https://prostormat.cz/prihlaseni')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    rl.close()
  }
}

createVenueManager()
