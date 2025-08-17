import { NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { generateContactFormThankYouEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailové adresy" },
        { status: 400 }
      )
    }

    // Generate thank you email for the user
    const thankYouEmailData = generateContactFormThankYouEmail({
      name,
      email,
      subject,
      message
    })

    try {
      // Send thank you email to the user
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        replyTo: REPLY_TO_EMAIL,
        subject: thankYouEmailData.subject,
        html: thankYouEmailData.html,
        text: thankYouEmailData.text,
      })

      // Send notification email to admin (info@prostormat.cz)
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ['info@prostormat.cz'],
        replyTo: email, // Allow admin to reply directly to the user
        subject: `Nová zpráva z kontaktního formuláře: ${subject}`,
        html: `
<!DOCTYPE html>
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
            
            <p><strong>Jméno:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Předmět:</strong> ${subject}</p>
            
            <div class="message-box">
                <h3 style="margin: 0 0 15px 0; color: #2196f3;">Zpráva:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
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
        text: `
Nová zpráva z kontaktního formuláře - Prostormat

Jméno: ${name}
Email: ${email}
Předmět: ${subject}

Zpráva:
${message}

Odpovězte do 24 hodin! Uživatel očekává odpověď během pracovních dnů.

--
Prostormat – Administrace kontaktních formulářů
Tento email byl automaticky vygenerován z kontaktního formuláře na webu.
`
      })

      // Log to Email Flow tracking system
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailType: 'contact_form_thank_you',
            recipient: email,
            subject: thankYouEmailData.subject,
            status: 'sent',
            sentBy: 'system', // Since this is triggered by user action, not admin
            recipientType: 'contact_form_user'
          })
        })
      } catch (logError) {
        console.error('Failed to log email to Email Flow:', logError)
      }

      return NextResponse.json({
        success: true,
        message: "Zpráva byla úspěšně odeslána. Děkujeme za váš zájem!"
      })

    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      
      // Log error to Email Flow tracking system
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/email-flow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailType: 'contact_form_thank_you',
            recipient: email,
            subject: thankYouEmailData.subject,
            status: 'failed',
            error: emailError instanceof Error ? emailError.message : 'Unknown error',
            sentBy: 'system',
            recipientType: 'contact_form_user'
          })
        })
      } catch (logError) {
        console.error('Failed to log email error to Email Flow:', logError)
      }

      return NextResponse.json(
        { error: "Chyba při odesílání emailu. Zkuste to prosím znovu nebo nás kontaktujte přímo." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: "Chyba při zpracování formuláře" },
      { status: 500 }
    )
  }
}