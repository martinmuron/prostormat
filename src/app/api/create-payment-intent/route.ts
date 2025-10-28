import { NextRequest, NextResponse } from 'next/server';
import { stripe, VENUE_PAYMENT_CONFIG, isStripeConfigured, createOrGetCustomer, STRIPE_PRICE_ID } from '@/lib/stripe';
import type Stripe from 'stripe';
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

    // Create or get Stripe customer
    const customer = await createOrGetCustomer(venueData.userEmail, {
      venueSubmission: 'true',
      venueName: venueData.name,
      submissionDate: new Date().toISOString(),
      submissionMode: mode,
      existingVenueId,
    });

    // Create subscription with Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        venueSubmission: 'true',
        venueName: venueData.name,
        userEmail: venueData.userEmail,
        submissionDate: new Date().toISOString(),
        submissionMode: mode,
        existingVenueId,
      },
    });

    // Get the payment intent from the subscription's latest invoice
    const latestInvoice = subscription.latest_invoice;
    if (!latestInvoice || typeof latestInvoice === 'string') {
      throw new Error('Failed to get invoice from subscription');
    }

    const invoice = latestInvoice as Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent | string | null;
    };
    const paymentIntent = invoice.payment_intent ?? null;
    if (!paymentIntent || typeof paymentIntent === 'string') {
      throw new Error('Failed to get payment intent from invoice');
    }

    // Store pending subscription in database for tracking
    // We'll create the actual venue after successful payment
    await prisma.paymentIntent.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        venueData: JSON.stringify({
          ...venueData,
          subscriptionId: subscription.id,
          customerId: customer.id,
          stripeAmount: typeof paymentIntent.amount === 'number'
            ? paymentIntent.amount
            : null,
          stripeCurrency: paymentIntent.currency
            ? paymentIntent.currency.toUpperCase()
            : VENUE_PAYMENT_CONFIG.currency.toUpperCase(),
        }),
        userEmail: venueData.userEmail,
        status: 'pending',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      amount: VENUE_PAYMENT_CONFIG.amount,
      currency: VENUE_PAYMENT_CONFIG.currency,
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
