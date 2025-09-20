import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { venueId } = await request.json();

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      );
    }

    // Get venue details
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        manager: true, // Get venue manager details
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    if (venue.status !== 'pending') {
      return NextResponse.json(
        { error: 'Venue is not pending approval' },
        { status: 400 }
      );
    }

    // Update venue status to published
    await prisma.venue.update({
      where: { id: venueId },
      data: {
        status: 'published',
        updatedAt: new Date(),
      },
    });

    // Send approval notification email to venue owner
    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: venue.manager.email!,
        subject: '🎉 Váš prostor byl schválen!',
        html: `
          <h2>Gratulujeme! Váš prostor byl schválen</h2>
          <p>Dobrá zpráva! Váš prostor "<strong>${venue.name}</strong>" byl úspěšně schválen a je nyní zveřejněn na platformě Prostormat.</p>
          
          <h3>Co to znamená pro vás?</h3>
          <ul>
            <li>✅ Váš prostor je nyní viditelný pro všechny uživatele</li>
            <li>🎯 Můžete začít přijímat rezervace a poptávky</li>
            <li>📊 Máte přístup k statistikám ve svém dashboardu</li>
            <li>📧 Budete dostávat notifikace o nových poptávkách</li>
          </ul>
          
          <h3>Další kroky:</h3>
          <ol>
            <li><a href="https://prostormat.cz/prihlaseni">Přihlaste se do svého účtu</a></li>
            <li>Zkontrolujte a doplňte informace o prostoru</li>
            <li>Nastavte si notifikace pro nové poptávky</li>
            <li>Začněte přijímat první rezervace!</li>
          </ol>
          
          <p><a href="https://prostormat.cz/prostory/${venue.slug}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Zobrazit váš prostor</a></p>
          
          <p>Děkujeme, že jste se k nám přidali!<br>Tým Prostormat</p>
          
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            Pokud máte jakékoli dotazy, neváhejte nás kontaktovat na <a href="mailto:info@prostormat.cz">info@prostormat.cz</a>
          </p>
        `,
      });

      // Log the email (skip for now due to model issues)
      try {
        // await prisma.emailFlowLog.create({
        //   data: {
        //     id: nanoid(),
        //     emailType: 'venue_approval_confirmation',
        //     recipient: venue.manager.email!,
        //     subject: 'Váš prostor byl schválen!',
        //     status: 'sent',
        //     recipientType: 'venue_owner',
        //     sentBy: 'system', // We don't have admin user ID here
        //     createdAt: new Date(),
        //   },
        // });
        console.log('Email sent successfully (logging temporarily disabled)');
      } catch (logError) {
        console.error('Failed to log email:', logError);
      }

    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      message: 'Venue approved successfully',
      success: true,
    });

  } catch (error) {
    console.error('Error approving venue:', error);
    return NextResponse.json(
      { error: 'Failed to approve venue' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all pending venues
    const pendingVenues = await prisma.venue.findMany({
      where: { status: 'pending' },
      include: {
        manager: {
          select: {
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get payment information for each venue
    const venuesWithPayments = await Promise.all(
      pendingVenues.map(async (venue) => {
        const payment = await prisma.$queryRaw<{
          amount: number;
          currency: string;
          payment_completed_at: Date;
          stripe_payment_intent_id: string;
        }[]>`
          SELECT amount, currency, payment_completed_at, stripe_payment_intent_id
          FROM paymentIntent 
          WHERE venue_id = ${venue.id} AND status = 'completed'
          LIMIT 1
        `;

        return {
          ...venue,
          payment: payment[0] || null,
        };
      })
    );

    return NextResponse.json({
      venues: venuesWithPayments,
      count: venuesWithPayments.length,
    });

  } catch (error) {
    console.error('Error fetching pending venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending venues' },
      { status: 500 }
    );
  }
}
