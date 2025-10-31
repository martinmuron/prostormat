import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

import { stripe, isStripeConfigured, determinePriorityLevelFromSubscription } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { nanoid } from 'nanoid';
import { getAdminUserIdForSystemEmails } from '@/lib/email-helpers';
import {
  processVenuePayment,
  PaymentProcessingInProgressError,
} from '@/lib/payments/process-venue-payment';

const getCurrentPeriodEndDate = (subscription: Stripe.Subscription): Date | null => {
  const unix = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return typeof unix === 'number' ? new Date(unix * 1000) : null;
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice): string | null => {
  const subscriptionField = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription ?? null;
  if (!subscriptionField) return null;
  return typeof subscriptionField === 'string' ? subscriptionField : subscriptionField.id;
};

type VenuePrioritySnapshot = {
  id: string
  priority: number | null
  prioritySource?: string | null
}

async function syncVenuePriorityWithSubscription(
  venue: VenuePrioritySnapshot,
  subscription: Stripe.Subscription
) {
  const currentPriority = venue.priority ?? null
  const currentSource = venue.prioritySource ?? null
  const desiredPriority = determinePriorityLevelFromSubscription(subscription)

  if (desiredPriority !== null) {
    if (currentPriority !== desiredPriority || currentSource !== 'subscription') {
      await prisma.venue.update({
        where: { id: venue.id },
        data: {
          priority: desiredPriority,
          prioritySource: 'subscription',
        },
      })
    }
    return
  }

  if (currentSource === 'subscription' && currentPriority !== null) {
    await prisma.venue.update({
      where: { id: venue.id },
      data: {
        priority: null,
        prioritySource: null,
      },
    })
  }
}

async function clearSubscriptionPriority(venue: VenuePrioritySnapshot) {
  if ((venue.prioritySource ?? null) === 'subscription' && (venue.priority ?? null) !== null) {
    await prisma.venue.update({
      where: { id: venue.id },
      data: {
        priority: null,
        prioritySource: null,
      },
    })
  }
}

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
        await handleOneOffPaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handleOneOffPaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
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

async function handleOneOffPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
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

    const paymentRecord = await prisma.paymentIntent.findUnique({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (paymentRecord) {
      try {
        const venueData = JSON.parse(paymentRecord.venueData);

        await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: paymentRecord.userEmail,
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

async function handleOneOffPaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  try {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    // Get customer details
    const customer = await stripe?.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }

    const customerEmail = customer.email;
    if (!customerEmail) {
      console.error('Customer email not found');
      return;
    }

    // Calculate expiry date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const metadataVenueId = typeof subscription.metadata?.venueId === 'string'
      ? subscription.metadata.venueId
      : null;

    let venue = null;

    if (metadataVenueId) {
      venue = await prisma.venue.findUnique({
        where: { id: metadataVenueId },
        include: {
          manager: true,
        },
      });
    }

    if (!venue) {
      venue = await prisma.venue.findFirst({
        where: {
          manager: {
            email: customerEmail,
          },
        },
        include: {
          manager: true,
        },
      });
    }

    if (venue) {
      // Update venue with subscription info
      const updatedVenue = await prisma.venue.update({
        where: { id: venue.id },
        data: {
          paid: true,
          paymentDate: new Date(),
          expiresAt: expiresAt,
          subscriptionId: subscription.id,
        },
        select: {
          id: true,
          priority: true,
          prioritySource: true,
        },
      });

      await syncVenuePriorityWithSubscription(updatedVenue, subscription);

      // Create or update subscription record
      await prisma.subscription.upsert({
        where: { venueId: venue.id },
        create: {
          id: nanoid(),
          venueId: venue.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          status: subscription.status,
          currentPeriodEnd: getCurrentPeriodEndDate(subscription) ?? expiresAt,
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          status: subscription.status,
          currentPeriodEnd: getCurrentPeriodEndDate(subscription) ?? expiresAt,
        },
      });

      console.log(`Venue ${venue.id} marked as paid with subscription ${subscription.id}`);
    }

    // Log subscription creation
    const adminUserId = await getAdminUserIdForSystemEmails()
    if (adminUserId) {
      await prisma.emailFlowLog.create({
        data: {
          id: nanoid(),
          emailType: 'stripe_webhook_subscription_created',
          recipient: customerEmail,
          subject: `Subscription created: ${subscription.id}`,
          status: 'processed',
          recipientType: 'venue_owner',
          sentBy: adminUserId,
          createdAt: new Date(),
        },
      })
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  try {
    // Update subscription record in database
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: {
        venue: {
          include: {
            manager: true,
          },
        },
      },
    });

    if (subscriptionRecord) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd: getCurrentPeriodEndDate(subscription) ?? subscriptionRecord.currentPeriodEnd,
        },
      });

      let venueSnapshot: VenuePrioritySnapshot | null = null;

      if (subscription.status === 'active') {
        venueSnapshot = await prisma.venue.update({
          where: { id: subscriptionRecord.venueId },
          data: {
            paid: true,
            expiresAt: getCurrentPeriodEndDate(subscription) ?? subscriptionRecord.currentPeriodEnd,
          },
          select: {
            id: true,
            priority: true,
            prioritySource: true,
          },
        });
      } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
        venueSnapshot = await prisma.venue.update({
          where: { id: subscriptionRecord.venueId },
          data: {
            paid: false,
          },
          select: {
            id: true,
            priority: true,
            prioritySource: true,
          },
        });
      } else {
        const existing = await prisma.venue.findUnique({
          where: { id: subscriptionRecord.venueId },
          select: {
            id: true,
            priority: true,
            prioritySource: true,
          },
        });
        if (existing) {
          venueSnapshot = existing;
        }
      }

      if (venueSnapshot) {
        await syncVenuePriorityWithSubscription(venueSnapshot, subscription);
      }

      console.log(`Subscription ${subscription.id} updated with status: ${subscription.status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  try {
    // Update subscription record in database
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: {
        venue: {
          include: {
            manager: true,
          },
        },
      },
    });

    if (subscriptionRecord) {
      // Mark venue as unpaid
      const updatedVenue = await prisma.venue.update({
        where: { id: subscriptionRecord.venueId },
        data: {
          paid: false,
        },
        select: {
          id: true,
          priority: true,
          prioritySource: true,
        },
      });

      await clearSubscriptionPriority(updatedVenue);

      // Update subscription status
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'canceled',
        },
      });

      // Send cancellation email to venue owner
      if (subscriptionRecord.venue.manager?.email) {
        try {
          await resend.emails.send({
            from: 'Prostormat <noreply@prostormat.cz>',
            to: subscriptionRecord.venue.manager.email,
            subject: '⚠️ Předplatné bylo zrušeno - Prostormat',
            html: `
              <h2>Vaše předplatné bylo zrušeno</h2>
              <p>Předplatné pro prostor "<strong>${subscriptionRecord.venue.name}</strong>" bylo zrušeno.</p>

              <h3>Co to znamená?</h3>
              <ul>
                <li>🏢 Váš prostor už nebude viditelný na platformě Prostormat</li>
                <li>💳 Nebudete dále účtováni</li>
                <li>🔄 Předplatné můžete kdykoliv obnovit</li>
              </ul>

              <p>Pokud jste předplatné nezrušili vy, kontaktujte nás prosím na info@prostormat.cz.</p>

              <p><a href="https://prostormat.cz/dashboard" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Obnovit předplatné</a></p>

              <p>S pozdravem,<br>Tým Prostormat</p>
            `,
          });

          // Log email
          const adminUserId = await getAdminUserIdForSystemEmails()
          if (adminUserId) {
            await prisma.emailFlowLog.create({
              data: {
                id: nanoid(),
                emailType: 'subscription_cancelled',
                recipient: subscriptionRecord.venue.manager.email,
                subject: 'Předplatné bylo zrušeno - Prostormat',
                status: 'sent',
                recipientType: 'venue_owner',
                sentBy: adminUserId,
                createdAt: new Date(),
              },
            })
          }
        } catch (emailError) {
          console.error('Failed to send subscription cancelled email:', emailError);
        }
      }

      console.log(`Subscription ${subscription.id} cancelled for venue ${subscriptionRecord.venueId}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);

  try {
    const subscriptionId = getInvoiceSubscriptionId(invoice);

    if (!subscriptionId) {
      console.log('No subscription associated with this invoice');
      return;
    }

    // Get subscription record
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: {
        venue: {
          include: {
            manager: true,
          },
        },
      },
    });

    if (subscriptionRecord) {
      // Calculate new expiry date (1 year from current period end)
      const expiresAt = new Date(subscriptionRecord.currentPeriodEnd);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Mark venue as paid and update expiry
      await prisma.venue.update({
        where: { id: subscriptionRecord.venueId },
        data: {
          paid: true,
          paymentDate: new Date(),
          expiresAt: expiresAt,
        },
      });

      // Send payment confirmation email
      if (subscriptionRecord.venue.manager?.email) {
        try {
          const isRenewal = invoice.billing_reason === 'subscription_cycle';

          await resend.emails.send({
            from: 'Prostormat <noreply@prostormat.cz>',
            to: subscriptionRecord.venue.manager.email,
            subject: isRenewal
              ? '✅ Předplatné bylo obnoveno - Prostormat'
              : '✅ Platba proběhla úspěšně - Prostormat',
            html: `
              <h2>${isRenewal ? 'Předplatné bylo obnoveno' : 'Platba proběhla úspěšně'}</h2>
              <p>Platba za prostor "<strong>${subscriptionRecord.venue.name}</strong>" byla úspěšně přijata.</p>

              <h3>Detaily platby</h3>
              <ul>
                <li>💳 Částka: ${(invoice.amount_paid / 100).toLocaleString('cs-CZ')} ${invoice.currency.toUpperCase()}</li>
                <li>📅 Datum platby: ${new Date().toLocaleDateString('cs-CZ')}</li>
                <li>🔄 ${isRenewal ? 'Další platba' : 'Platnost do'}: ${expiresAt.toLocaleDateString('cs-CZ')}</li>
              </ul>

              <p>Váš prostor je nyní aktivní na platformě Prostormat a je viditelný pro všechny návštěvníky.</p>

              <p><a href="https://prostormat.cz/dashboard" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Přejít do dashboardu</a></p>

              <p>S pozdravem,<br>Tým Prostormat</p>
            `,
          });

          // Log email
          const adminUserId = await getAdminUserIdForSystemEmails()
          if (adminUserId) {
            await prisma.emailFlowLog.create({
              data: {
                id: nanoid(),
                emailType: isRenewal ? 'subscription_renewed' : 'subscription_payment_success',
                recipient: subscriptionRecord.venue.manager.email,
                subject: isRenewal
                  ? 'Předplatné bylo obnoveno - Prostormat'
                  : 'Platba proběhla úspěšně - Prostormat',
                status: 'sent',
                recipientType: 'venue_owner',
                sentBy: adminUserId,
                createdAt: new Date(),
              },
            })
          }
        } catch (emailError) {
          console.error('Failed to send payment success email:', emailError);
        }
      }

      console.log(`Invoice ${invoice.id} processed for venue ${subscriptionRecord.venueId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  try {
    const subscriptionId = getInvoiceSubscriptionId(invoice);

    if (!subscriptionId) {
      console.log('No subscription associated with this invoice');
      return;
    }

    // Get subscription record
    const subscriptionRecord = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: {
        venue: {
          include: {
            manager: true,
          },
        },
      },
    });

    if (subscriptionRecord && subscriptionRecord.venue.manager?.email) {
      // Send payment failed notification
      try {
        await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: subscriptionRecord.venue.manager.email,
          subject: '❌ Platba předplatného se nezdařila - Prostormat',
          html: `
            <h2>Platba předplatného se nezdařila</h2>
            <p>Bohužel se nezdařila platba předplatného pro prostor "<strong>${subscriptionRecord.venue.name}</strong>".</p>

            <h3>Co můžete udělat?</h3>
            <ul>
              <li>💳 Zkontrolujte, zda máte na kartě dostatek prostředků</li>
              <li>🔄 Stripe automaticky zkusí platbu znovu za několik dní</li>
              <li>🏦 Kontaktujte svou banku ohledně případného blokování platby</li>
              <li>📧 Napište nám na info@prostormat.cz pro pomoc</li>
            </ul>

            <p><strong>Upozornění:</strong> Pokud se platba nezdaří ani po opakovaných pokusech, váš prostor bude deaktivován.</p>

            <p><a href="https://prostormat.cz/dashboard" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Aktualizovat platební údaje</a></p>

            <p>S pozdravem,<br>Tým Prostormat</p>
          `,
        });

        // Log email
        const adminUserId = await getAdminUserIdForSystemEmails()
        if (adminUserId) {
          await prisma.emailFlowLog.create({
            data: {
              id: nanoid(),
              emailType: 'subscription_payment_failed',
              recipient: subscriptionRecord.venue.manager.email,
              subject: 'Platba předplatného se nezdařila - Prostormat',
              status: 'sent',
              recipientType: 'venue_owner',
              sentBy: adminUserId,
              createdAt: new Date(),
            },
          })
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }
    }

    console.log(`Invoice payment failed for subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}
