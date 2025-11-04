import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getSafeSentByUserId } from '@/lib/email-helpers';
import { nanoid } from 'nanoid';

function extractClaimId(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    return null;
  }
  const claimId = segments[segments.length - 2];
  return claimId ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claimId = extractClaimId(request);

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const approvalResult = await prisma.$transaction(async (tx) => {
      const claim = await tx.venueClaim.findUnique({
        where: { id: claimId },
        include: {
          claimant: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
              managerId: true,
            },
          },
        },
      });

      if (!claim) {
        throw new Error('Venue claim not found');
      }

      if (claim.status === 'approved') {
        return {
          claim,
          venue: claim.venue,
          alreadyApproved: true,
        };
      }

      if (claim.status !== 'pending') {
        throw new Error('Only pending claims can be approved');
      }

      const now = new Date();

      await tx.venue.update({
        where: { id: claim.venueId },
        data: {
          managerId: claim.claimantId,
          paid: true,
          updatedAt: now,
        },
      });

      await tx.venueClaim.update({
        where: { id: claimId },
        data: {
          status: 'approved',
          updatedAt: now,
        },
      });

      await tx.venueClaim.updateMany({
        where: {
          venueId: claim.venueId,
          id: {
            not: claimId,
          },
          status: {
            notIn: ['approved', 'rejected'],
          },
        },
        data: {
          status: 'rejected',
          updatedAt: now,
        },
      });

      return {
        claim,
        venue: claim.venue,
        alreadyApproved: false,
      };
    });

    if (!approvalResult.alreadyApproved && approvalResult.claim.claimant?.email) {
      const emailSubject = '🎉 Převzetí prostoru bylo schváleno';
      let emailStatus: 'sent' | 'failed' = 'sent';
      let emailError: string | null = null;
      let resendEmailId: string | null = null;

      try {
        const emailResult = await resend.emails.send({
          from: 'Prostormat <info@prostormat.cz>',
          to: approvalResult.claim.claimant.email,
          subject: emailSubject,
          html: `
            <h2>Gratulujeme! Převzetí prostoru bylo dokončeno</h2>
            <p>Převzetí listingu "<strong>${approvalResult.venue.name}</strong>" bylo právě schváleno.</p>
            <p>Jste nyní hlavním správcem prostoru na platformě Prostormat.</p>

            <h3>Další kroky:</h3>
            <ul>
              <li>Přihlaste se na <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></li>
              <li>Zkontrolujte a aktualizujte informace o prostoru</li>
              <li>Začněte přijímat nové poptávky</li>
            </ul>

            <p>Děkujeme, že jste s námi!<br>Tým Prostormat</p>
          `,
        });
        resendEmailId = emailResult.data?.id ?? null;
      } catch (error) {
        emailStatus = 'failed';
        emailError = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to send claim approval email:', error);
      }

      // Log email attempt to EmailFlowLog
      const sentByUserId = await getSafeSentByUserId(session?.user?.id);
      if (sentByUserId) {
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: nanoid(),
              emailType: 'venue_claim_approval',
              recipient: approvalResult.claim.claimant.email,
              subject: emailSubject,
              status: emailStatus,
              error: emailError,
              recipientType: 'venue_owner',
              sentBy: sentByUserId,
              resendEmailId: resendEmailId,
            },
          });
        } catch (logError) {
          console.error('Failed to log claim approval email:', logError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      alreadyApproved: approvalResult.alreadyApproved,
      message: approvalResult.alreadyApproved
        ? 'Žádost o převzetí již byla schválena.'
        : 'Žádost o převzetí byla úspěšně schválena.',
    });
  } catch (error) {
    console.error('Failed to approve venue claim:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se schválit žádost o převzetí.' },
      { status: 500 }
    );
  }
}
