import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  processVenuePayment,
  PaymentProcessingInProgressError,
} from '@/lib/payments/process-venue-payment';
import { isStripeConfigured, stripe } from '@/lib/stripe';

type SubmissionMode = 'new' | 'claim';

const WAIT_ATTEMPTS = 6;
const WAIT_DELAY_MS = 500;

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const extractSubmissionMode = (rawVenueData: string | null): SubmissionMode => {
  if (!rawVenueData) {
    return 'new';
  }

  try {
    const parsed = JSON.parse(rawVenueData);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'mode' in parsed &&
      typeof (parsed as { mode?: unknown }).mode === 'string'
    ) {
      return (parsed as { mode?: string }).mode === 'claim' ? 'claim' : 'new';
    }
  } catch (error) {
    console.warn('Failed to parse stored venue data', error);
  }

  return 'new';
};

async function pollForCompletedProcessing(
  paymentIntentId: string
): Promise<{
  submissionMode: SubmissionMode;
  venueId: string;
  claimId?: string;
  userId: string;
} | null> {
  for (let attempt = 0; attempt < WAIT_ATTEMPTS; attempt += 1) {
    const paymentRecord = await prisma.paymentIntent.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        venueClaim: {
          select: {
            id: true,
            claimantId: true,
            venueId: true,
          },
        },
      },
    });

    if (!paymentRecord) {
      return null;
    }

    if (paymentRecord.status === 'completed') {
      const submissionMode = extractSubmissionMode(paymentRecord.venueData);

      if (submissionMode === 'claim') {
        const claim = paymentRecord.venueClaim;
        if (!claim) {
          return null;
        }

        return {
          submissionMode,
          venueId: claim.venueId,
          claimId: claim.id,
          userId: claim.claimantId,
        };
      }

      if (!paymentRecord.venueId) {
        return null;
      }

      const venue = await prisma.venue.findUnique({
        where: { id: paymentRecord.venueId },
        select: {
          managerId: true,
        },
      });

      if (!venue) {
        return null;
      }

      return {
        submissionMode,
        venueId: paymentRecord.venueId,
        userId: venue.managerId,
      };
    }

    await delay(WAIT_DELAY_MS);
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    );
  }

  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    try {
      const result = await processVenuePayment({
        paymentIntent,
        request,
        source: 'confirm-endpoint',
      });

      return NextResponse.json({
        success: true,
        venueId: result.venueId,
        claimId: result.claimId,
        userId: result.userId,
        submissionMode: result.submissionMode,
        alreadyProcessed: result.alreadyProcessed,
      });
    } catch (error) {
      if (error instanceof PaymentProcessingInProgressError) {
        const fallback = await pollForCompletedProcessing(paymentIntentId);

        if (fallback) {
          return NextResponse.json({
            success: true,
            venueId: fallback.venueId,
            claimId: fallback.claimId,
            userId: fallback.userId,
            submissionMode: fallback.submissionMode,
            alreadyProcessed: true,
          });
        }

        return NextResponse.json(
          {
            error:
              'Platba byla přijata a právě ji dokončujeme. Zkuste prosím potvrzení znovu za několik sekund.',
          },
          { status: 202 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}
