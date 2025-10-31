import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  PaymentProcessingInProgressError,
  processVenuePayment,
} from '@/lib/payments/process-venue-payment';
import { resend } from '@/lib/resend';
import { isStripeConfigured, stripe } from '@/lib/stripe';
import { nanoid } from 'nanoid';
import { getAdminUserIdForSystemEmails } from '@/lib/email-helpers';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        try {
          await processVenuePayment({
            paymentIntent: event.data.object as Stripe.PaymentIntent,
            request,
            source: 'webhook',
          });
        } catch (processingError) {
          if (processingError instanceof PaymentProcessingInProgressError) {
            console.log(
              `Payment intent ${event.data.object.id} is already being processed`
            );
          } else {
            throw processingError;
          }
        }
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    await prisma.paymentIntent.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        status: {
          notIn: ['completed'],
        },
      },
      data: {
        status: 'failed',
      },
    });

    // Get payment details to notify user
    const paymentRecord = await prisma.paymentIntent.findUnique({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (paymentRecord) {
      const venueData = JSON.parse(paymentRecord.venueData);

      // Send payment failed notification
      const emailSubject = '❌ Platba se nezdařila - Prostormat'
      let emailStatus: 'sent' | 'failed' = 'sent'
      let emailError: string | null = null

      try {
        await resend.emails.send({
          from: 'Prostormat <info@prostormat.cz>',
          to: paymentRecord.userEmail,
          subject: emailSubject,
          html: `
            <h2>Platba se nezdařila</h2>
            <p>Bohužel se nezdařila platba za přidání prostoru "<strong>${venueData.name}</strong>" na platformu Prostormat.</p>

            <h3>Co můžete udělat?</h3>
            <ul>
              <li>🔄 Zkuste platbu znovu s jinou kartou</li>
              <li>💳 Zkontrolujte, zda máte na kartě dostatek prostředků</li>
              <li>🏦 Kontaktujte svou banku ohledně případného blokování platby</li>
              <li>📧 Napište nám na info@prostormat.cz pro pomoc</li>
            </ul>

            <p><a href="https://prostormat.cz/pridat-prostor" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Zkusit znovu</a></p>

            <p>S pozdravem,<br>Tým Prostormat</p>
          `,
        });
      } catch (sendError) {
        emailStatus = 'failed'
        emailError = sendError instanceof Error ? sendError.message : 'Unknown error'
        console.error('Failed to send payment failed email:', sendError);
      }

      // Track payment failed email
      const adminUserId = await getAdminUserIdForSystemEmails()
      if (adminUserId) {
        try {
          await prisma.emailFlowLog.create({
            data: {
              id: nanoid(),
              emailType: 'payment_failed_notification',
              recipient: paymentRecord.userEmail,
              subject: emailSubject,
              status: emailStatus,
              error: emailError,
              recipientType: 'venue_owner',
              sentBy: adminUserId,
            },
          });
        } catch (logError) {
          console.error('Failed to log payment failed email:', logError)
        }
      }
    }

    console.log(`Payment ${paymentIntent.id} marked as failed`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment canceled:', paymentIntent.id);

  try {
    await prisma.paymentIntent.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        status: {
          notIn: ['completed'],
        },
      },
      data: {
        status: 'canceled',
      },
    });

    console.log(`Payment ${paymentIntent.id} marked as canceled`);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}
