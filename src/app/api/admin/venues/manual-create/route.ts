import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import { resend } from '@/lib/resend'
import { getSafeSentByUserId } from '@/lib/email-helpers'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const {
      userId,
      name,
      description,
      address,
      district,
      capacitySeated,
      capacityStanding,
      venueType,
      contactEmail,
      contactPhone,
      websiteUrl,
      instagramUrl,
      videoUrl,
      musicAfter10,
      amenities,
      paymentDate,
      paymentAmount,
      paymentNote,
    } = data

    // Validate required fields
    if (!userId || !name || !description || !address || !district ||
        !capacitySeated || !capacityStanding || !venueType ||
        !contactEmail || !contactPhone || !websiteUrl || !paymentDate || !paymentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create venue
    const venueId = nanoid()
    const venueSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const venue = await db.venue.create({
      data: {
        id: venueId,
        name,
        slug: `${venueSlug}-${venueId.slice(0, 8)}`,
        description,
        address,
        district,
        capacitySeated,
        capacityStanding,
        venueType,
        amenities: amenities || [],
        contactEmail,
        contactPhone,
        websiteUrl,
        instagramUrl: instagramUrl || null,
        videoUrl: videoUrl || null,
        musicAfter10: musicAfter10 || false,
        status: 'published', // Manually created venues are automatically published
        managerId: userId,
        paymentDate: new Date(paymentDate),
        expiresAt: new Date(new Date(paymentDate).getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from payment
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Update user role to venue_manager if not already
    if (user.role === 'user') {
      await db.user.update({
        where: { id: userId },
        data: { role: 'venue_manager' }
      })
    }

    // Log manual creation (for audit purposes)
    try {
      await db.emailFlowLog.create({
        data: {
          id: nanoid(),
          emailType: 'manual_venue_creation',
          recipient: user.email,
          subject: `Manual venue creation: ${name}`,
          status: 'completed',
          recipientType: 'venue_owner',
          sentBy: session.user.id!,
          createdAt: new Date(),
        },
      })
    } catch (logError) {
      console.error('Failed to log manual venue creation:', logError)
    }

    // Send notification email to venue owner
    const ownerEmailSubject = '✅ Váš prostor byl přidán na Prostormat'
    let ownerEmailStatus: 'sent' | 'failed' = 'sent'
    let ownerEmailError: string | null = null

    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: user.email,
        subject: ownerEmailSubject,
        html: `
          <h2>Váš prostor byl úspěšně přidán!</h2>
          <p>Dobrý den,</p>
          <p>Váš prostor "<strong>${name}</strong>" byl úspěšně přidán na platformu Prostormat a je nyní zveřejněný.</p>

          <h3>Detaily prostoru:</h3>
          <ul>
            <li><strong>Název:</strong> ${name}</li>
            <li><strong>Adresa:</strong> ${address}, ${district}</li>
            <li><strong>Typ:</strong> ${venueType}</li>
            <li><strong>Kapacita:</strong> ${capacitySeated} sedící / ${capacityStanding} stojící</li>
          </ul>

          <h3>Platba:</h3>
          <ul>
            <li><strong>Částka:</strong> ${paymentAmount} CZK</li>
            <li><strong>Datum:</strong> ${new Date(paymentDate).toLocaleDateString('cs-CZ')}</li>
            ${paymentNote ? `<li><strong>Poznámka:</strong> ${paymentNote}</li>` : ''}
          </ul>

          <p><strong>Co můžete dělat:</strong></p>
          <ul>
            <li>✅ Váš prostor je nyní viditelný na platformě</li>
            <li>✅ Můžete přijímat rezervace od klientů</li>
            <li>✏️ Můžete upravovat údaje v administraci</li>
            <li>📧 Budete dostávat emaily s poptávkami</li>
          </ul>

          <p>Přihlásit se můžete na: <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></p>

          <p>Děkujeme za důvěru!<br>Tým Prostormat</p>
        `,
      })
    } catch (emailError) {
      ownerEmailStatus = 'failed'
      ownerEmailError = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('Failed to send venue creation email:', emailError)
    }

    // Track venue owner email
    const ownerEmailSentBy = await getSafeSentByUserId(session?.user?.id)
    if (ownerEmailSentBy) {
      try {
        await db.emailFlowLog.create({
          data: {
            id: nanoid(),
            emailType: 'manual_venue_creation_owner_notification',
            recipient: user.email,
            subject: ownerEmailSubject,
            status: ownerEmailStatus,
            error: ownerEmailError,
            recipientType: 'venue_owner',
            sentBy: ownerEmailSentBy,
          },
        })
      } catch (logError) {
        console.error('Failed to log venue owner email:', logError)
      }
    }

    // Send notification to admin
    const adminEmailSubject = '🔧 Manuálně vytvořený prostor'
    let adminEmailStatus: 'sent' | 'failed' = 'sent'
    let adminEmailError: string | null = null

    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: 'info@prostormat.cz',
        subject: adminEmailSubject,
        html: `
          <h2>Byl manuálně vytvořen nový prostor</h2>
          <p><strong>Prostor:</strong> ${name}</p>
          <p><strong>Majitel:</strong> ${user.name ? `${user.name} (${user.email})` : user.email}</p>
          <p><strong>Adresa:</strong> ${address}, ${district}</p>
          <p><strong>Vytvořil:</strong> ${session.user.email}</p>
          <p><strong>Platba:</strong> ${paymentAmount} CZK (${new Date(paymentDate).toLocaleDateString('cs-CZ')})</p>
          ${paymentNote ? `<p><strong>Poznámka k platbě:</strong> ${paymentNote}</p>` : ''}

          <p>Prostor je automaticky zveřejněný.</p>
        `,
      })
    } catch (emailError) {
      adminEmailStatus = 'failed'
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('Failed to send admin notification:', emailError)
    }

    // Track admin notification email
    const adminEmailSentBy = await getSafeSentByUserId(session?.user?.id)
    if (adminEmailSentBy) {
      try {
        await db.emailFlowLog.create({
          data: {
            id: nanoid(),
            emailType: 'manual_venue_creation_admin_notification',
            recipient: 'info@prostormat.cz',
            subject: adminEmailSubject,
            status: adminEmailStatus,
            error: adminEmailError,
            recipientType: 'admin',
            sentBy: adminEmailSentBy,
          },
        })
      } catch (logError) {
        console.error('Failed to log admin notification email:', logError)
      }
    }

    return NextResponse.json({
      success: true,
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
      }
    })

  } catch (error) {
    console.error('Error creating manual venue:', error)
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    )
  }
}
