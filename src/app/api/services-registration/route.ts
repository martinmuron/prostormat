import { NextResponse } from "next/server"
import { resend } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { name, companyName, email, phone, website, serviceType, message } = data

    // Validate required fields
    if (!name || !companyName || !email || !phone || !serviceType) {
      return NextResponse.json(
        { error: "Vyplňte prosím všechna povinná pole" },
        { status: 400 }
      )
    }

    // Send notification email to admin
    await resend.emails.send({
      from: "Prostormat <noreply@prostormat.cz>",
      to: "info@prostormat.cz",
      replyTo: email,
      subject: `Nová registrace služby: ${companyName}`,
      html: `
        <h2>Nová registrace poskytovatele služeb</h2>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>Firma:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Web:</strong> ${website || "Neuvedeno"}</p>
        <p><strong>Typ služby:</strong> ${serviceType}</p>
        <p><strong>Poznámka:</strong> ${message || "Bez poznámky"}</p>
        <hr>
        <p><em>Registrace ze stránky /sluzby - spuštění 1.12.2025</em></p>
      `,
      text: `
Nová registrace poskytovatele služeb

Jméno: ${name}
Firma: ${companyName}
Email: ${email}
Telefon: ${phone}
Web: ${website || "Neuvedeno"}
Typ služby: ${serviceType}
Poznámka: ${message || "Bez poznámky"}

Registrace ze stránky /sluzby - spuštění 1.12.2025
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Services registration error:", error)
    return NextResponse.json(
      { error: "Nepodařilo se odeslat registraci" },
      { status: 500 }
    )
  }
}
