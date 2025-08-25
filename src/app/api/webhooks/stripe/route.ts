import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
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
        await handlePaymentSucceeded(event.data.object);
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

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    // Update payment status in database
    await prisma.$executeRaw`
      UPDATE prostormat_payment_intents 
      SET 
        status = 'succeeded',
        updated_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
      AND status = 'pending'
    `;

    // Log successful payment webhook
    await prisma.prostormat_email_flow_logs.create({
      data: {
        id: nanoid(),
        emailType: 'stripe_webhook_payment_succeeded',
        recipient: 'system',
        subject: `Payment succeeded: ${paymentIntent.id}`,
        status: 'processed',
        recipientType: 'system',
        sentBy: 'stripe_webhook',
        createdAt: new Date(),
      },
    });

    console.log(`Payment ${paymentIntent.id} marked as succeeded`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    // Update payment status in database
    await prisma.$executeRaw`
      UPDATE prostormat_payment_intents 
      SET 
        status = 'failed',
        updated_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `;

    // Get payment details to notify user
    const paymentRecord = await prisma.$queryRaw<{
      id: string;
      venue_data: string;
      user_email: string;
    }[]>`
      SELECT id, venue_data, user_email 
      FROM prostormat_payment_intents 
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
      LIMIT 1
    `;

    if (paymentRecord && paymentRecord.length > 0) {
      const payment = paymentRecord[0];
      const venueData = JSON.parse(payment.venue_data);

      // Send payment failed notification
      try {
        await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: payment.user_email,
          subject: '❌ Platba se nezdařila - Prostormat',
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

        // Log the email
        await prisma.prostormat_email_flow_logs.create({
          data: {
            id: nanoid(),
            emailType: 'payment_failed_notification',
            recipient: payment.user_email,
            subject: 'Platba se nezdařila - Prostormat',
            status: 'sent',
            recipientType: 'venue_owner',
            sentBy: 'stripe_webhook',
            createdAt: new Date(),
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }
    }

    console.log(`Payment ${paymentIntent.id} marked as failed`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  console.log('Payment canceled:', paymentIntent.id);

  try {
    // Update payment status in database
    await prisma.$executeRaw`
      UPDATE prostormat_payment_intents 
      SET 
        status = 'canceled',
        updated_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `;

    console.log(`Payment ${paymentIntent.id} marked as canceled`);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}