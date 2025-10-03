import { NextRequest, NextResponse } from 'next/server';
import { stripe, VENUE_PAYMENT_CONFIG, isStripeConfigured } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

    const { venueData } = await request.json();

    // Validate required fields
    if (!venueData?.name || !venueData?.userEmail) {
      return NextResponse.json(
        { error: 'Missing required venue data' },
        { status: 400 }
      );
    }

    const mode: 'new' | 'claim' = venueData?.mode === 'claim' ? 'claim' : 'new';
    const existingVenueId = mode === 'claim' ? venueData?.existingVenueId ?? '' : '';

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: VENUE_PAYMENT_CONFIG.amount,
      currency: VENUE_PAYMENT_CONFIG.currency,
      description:
        mode === 'claim'
          ? `Claim existing venue - ${venueData.name}`
          : `${VENUE_PAYMENT_CONFIG.description} - ${venueData.name}`,
      metadata: {
        venueSubmission: 'true',
        venueName: venueData.name,
        userEmail: venueData.userEmail,
        submissionDate: new Date().toISOString(),
        submissionMode: mode,
        existingVenueId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store pending payment in database for tracking
    // We'll create the actual venue after successful payment
    await prisma.paymentIntent.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        venueData: JSON.stringify(venueData),
        userEmail: venueData.userEmail,
        status: 'pending',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: VENUE_PAYMENT_CONFIG.amount,
      currency: VENUE_PAYMENT_CONFIG.currency,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
