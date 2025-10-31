import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { VENUE_PAYMENT_CONFIG } from '@/lib/stripe';
import { sanitizeTrackingContext } from '@/lib/tracking-utils';
import { trackLocationRegistration, trackPayment } from '@/lib/meta-conversions-api';
import { trackGA4ServerLocationRegistration, trackGA4ServerPayment } from '@/lib/ga4-server-tracking';

type SubmissionMode = 'new' | 'claim';

export interface VenuePaymentPayload {
  mode?: SubmissionMode;
  existingVenueId?: string;
  userName?: string | null;
  userEmail?: string | null;
  userPassword?: string | null;
  userPhone?: string | null;
  userId?: string | null;
  name?: string;
  description?: string | null;
  address?: string;
  district?: string | null;
  capacitySeated?: number | null;
  capacityStanding?: number | null;
  venueType?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  videoUrl?: string | null;
  musicAfter10?: boolean;
  amenities?: string[];
  images?: string[];
  subscriptionId?: string | null;
  customerId?: string | null;
  stripeAmount?: number | null;
  stripeCurrency?: string | null;
  tracking?: unknown;
  [key: string]: unknown;
}

function parseVenueData(raw: string | null): VenuePaymentPayload {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as VenuePaymentPayload;
    }
  } catch (error) {
    console.warn('Failed to parse venue data payload', error);
  }

  return {};
}

export class PaymentProcessingInProgressError extends Error {
  constructor(message = 'Payment processing is already in progress') {
    super(message);
    this.name = 'PaymentProcessingInProgressError';
  }
}

interface ProcessVenuePaymentOptions {
  paymentIntent: Stripe.PaymentIntent;
  request?: NextRequest;
  source: 'webhook' | 'confirm-endpoint';
}

interface ProcessVenuePaymentBaseResult {
  submissionMode: SubmissionMode;
  venueId: string;
  userId: string;
  claimId?: string;
}

interface ProcessVenuePaymentCompletedResult extends ProcessVenuePaymentBaseResult {
  alreadyProcessed: false;
  venueName: string;
  venueSlug?: string | null;
  userEmail: string;
  expiresAt: Date;
  normalizedName: string | null;
  normalizedPhone: string | null;
  tracking: ReturnType<typeof sanitizeTrackingContext>;
  venueData: VenuePaymentPayload;
  claimStatus?: string;
}

interface ProcessVenuePaymentAlreadyProcessedResult extends ProcessVenuePaymentBaseResult {
  alreadyProcessed: true;
}

export type ProcessVenuePaymentResult =
  | ProcessVenuePaymentCompletedResult
  | ProcessVenuePaymentAlreadyProcessedResult;

function ensureAmountMatch(
  paymentIntent: Stripe.PaymentIntent,
  venueData: VenuePaymentPayload
) {
  const storedAmountRaw = venueData?.stripeAmount;
  const storedCurrencyRaw = venueData?.stripeCurrency;

  const expectedAmount =
    typeof storedAmountRaw === 'number'
      ? storedAmountRaw
      : VENUE_PAYMENT_CONFIG.amount;

  const expectedCurrency = (typeof storedCurrencyRaw === 'string'
    ? storedCurrencyRaw
    : VENUE_PAYMENT_CONFIG.currency
  ).toUpperCase();

  const actualAmount =
    typeof paymentIntent.amount_received === 'number' &&
    paymentIntent.amount_received > 0
      ? paymentIntent.amount_received
      : paymentIntent.amount ?? 0;

  const actualCurrency = (paymentIntent.currency || '').toUpperCase();

  if (actualAmount !== expectedAmount) {
    throw new Error(
      `Unexpected payment amount detected. Expected ${expectedAmount}, received ${actualAmount}`
    );
  }

  if (!actualCurrency || actualCurrency !== expectedCurrency) {
    throw new Error(
      `Unexpected payment currency detected. Expected ${expectedCurrency}, received ${actualCurrency || 'N/A'}`
    );
  }
}

export async function processVenuePayment({
  paymentIntent,
  request,
  source,
}: ProcessVenuePaymentOptions): Promise<ProcessVenuePaymentResult> {
  if (paymentIntent.status !== 'succeeded') {
    throw new Error(
      `Payment intent ${paymentIntent.id} is not in succeeded status (status: ${paymentIntent.status})`
    );
  }

  const now = new Date();
  const paymentIntentId = paymentIntent.id;

  let processingResult:
    | ProcessVenuePaymentCompletedResult
    | ProcessVenuePaymentAlreadyProcessedResult
    | null = null;

  try {
    await prisma.$transaction(
      async (tx) => {
        const paymentRecord = await tx.paymentIntent.findUnique({
          where: { stripePaymentIntentId: paymentIntentId },
        });

        if (!paymentRecord) {
          throw new Error(
            `No payment record found for payment intent ${paymentIntentId}`
          );
        }

        const venueDataPreparsed = parseVenueData(paymentRecord.venueData);
        const submissionModePreparsed: SubmissionMode =
          venueDataPreparsed?.mode === 'claim' ? 'claim' : 'new';

        if (paymentRecord.status === 'completed') {
          if (submissionModePreparsed === 'claim') {
            if (!paymentRecord.venueClaimId) {
              throw new Error('Completed claim payment missing claim id.');
            }

            const claim = await tx.venueClaim.findUnique({
              where: { id: paymentRecord.venueClaimId },
              select: {
                claimantId: true,
                venueId: true,
              },
            });

            if (!claim) {
              throw new Error(
                'Claim record not found for completed payment intent.'
              );
            }

            processingResult = {
              alreadyProcessed: true,
              submissionMode: submissionModePreparsed,
              userId: claim.claimantId,
              venueId: claim.venueId,
              claimId: paymentRecord.venueClaimId ?? undefined,
            };
          } else {
            if (!paymentRecord.venueId) {
              throw new Error(
                'Completed venue payment missing venue association.'
              );
            }

            const venue = await tx.venue.findUnique({
              where: { id: paymentRecord.venueId },
              select: {
                managerId: true,
              },
            });

            if (!venue) {
              throw new Error('Venue not found for completed payment intent.');
            }

            processingResult = {
              alreadyProcessed: true,
              submissionMode: submissionModePreparsed,
              userId: venue.managerId,
              venueId: paymentRecord.venueId,
              claimId: paymentRecord.venueClaimId ?? undefined,
            };
          }
          return;
        }

        if (paymentRecord.status === 'processing') {
          throw new PaymentProcessingInProgressError();
        }

        if (!['pending', 'succeeded'].includes(paymentRecord.status)) {
          throw new Error(
            `Payment intent ${paymentIntentId} in unexpected state: ${paymentRecord.status}`
          );
        }

        const venueData = venueDataPreparsed;

        ensureAmountMatch(paymentIntent, venueData);

        const submissionMode: SubmissionMode =
          venueData?.mode === 'claim' ? 'claim' : 'new';

        const normalizedName =
          typeof venueData.userName === 'string'
            ? venueData.userName.trim()
            : null;
        const normalizedPhone =
          typeof venueData.userPhone === 'string'
            ? venueData.userPhone.trim()
            : null;

        const tracking = sanitizeTrackingContext(venueData.tracking);

        // Update status to processing within the transaction (will rollback on failure)
        await tx.paymentIntent.update({
          where: { id: paymentRecord.id },
          data: {
            status: 'processing',
            updatedAt: now,
          },
        });

        let userId: string;
        let userEmail: string;

        if (venueData.userId) {
          const existingUser = await tx.user.findUnique({
            where: { id: venueData.userId },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          });

          if (!existingUser) {
            throw new Error(
              `User account not found for provided userId ${venueData.userId}`
            );
          }

          userId = existingUser.id;
          userEmail = existingUser.email;

          const userUpdateData: Record<string, unknown> = {};

          if (normalizedName && normalizedName.length > 0) {
            userUpdateData.name = normalizedName;
          }

          if (typeof venueData.userPhone === 'string') {
            userUpdateData.phone =
              normalizedPhone && normalizedPhone.length > 0
                ? normalizedPhone
                : null;
          }

          if (existingUser.role === 'user') {
            userUpdateData.role = 'venue_manager';
          }

          if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
              where: { id: userId },
              data: userUpdateData,
            });
          }
        } else {
          if (typeof venueData.userEmail !== 'string') {
            throw new Error('User email is required for new registrations');
          }

          userEmail = venueData.userEmail;

          const existingUser = await tx.user.findUnique({
            where: { email: userEmail },
            select: {
              id: true,
              role: true,
            },
          });

          if (existingUser) {
            userId = existingUser.id;

            const userUpdateData: Record<string, unknown> = {};

            if (normalizedName && normalizedName.length > 0) {
              userUpdateData.name = normalizedName;
            }

            if (typeof venueData.userPhone === 'string') {
              userUpdateData.phone =
                normalizedPhone && normalizedPhone.length > 0
                  ? normalizedPhone
                  : null;
            }

            if (existingUser.role === 'user') {
              userUpdateData.role = 'venue_manager';
            }

            if (venueData.userPassword) {
              const hashedPassword = await bcrypt.hash(
                venueData.userPassword,
                12
              );
              userUpdateData.password = hashedPassword;
            }

            if (Object.keys(userUpdateData).length > 0) {
              await tx.user.update({
                where: { id: userId },
                data: userUpdateData,
              });
            }
          } else {
            if (!venueData.userPassword) {
              throw new Error('Password is required for new user registration');
            }

            const hashedPassword = await bcrypt.hash(
              venueData.userPassword,
              12
            );

            userId = nanoid();

            await tx.user.create({
              data: {
                id: userId,
                name:
                  normalizedName && normalizedName.length > 0
                    ? normalizedName
                    : null,
                email: userEmail,
                password: hashedPassword,
                phone:
                  normalizedPhone === null
                    ? null
                    : normalizedPhone.length > 0
                      ? normalizedPhone
                      : null,
                role: 'venue_manager',
                createdAt: now,
              },
            });
          }
        }

        const subscriptionId =
          typeof venueData.subscriptionId === 'string'
            ? venueData.subscriptionId
            : null;
        const customerId =
          typeof venueData.customerId === 'string'
            ? venueData.customerId
            : null;

        const expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        if (submissionMode === 'claim') {
          if (!venueData.existingVenueId) {
            throw new Error(
              'existingVenueId is required for claim submissions'
            );
          }

          const existingVenue = await tx.venue.findUnique({
            where: { id: venueData.existingVenueId },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          });

          if (!existingVenue) {
            throw new Error(
              `Existing venue ${venueData.existingVenueId} not found for claim submission`
            );
          }

          let claimRecordId = paymentRecord.venueClaimId || null;

          if (claimRecordId) {
            const existingClaim = await tx.venueClaim.findUnique({
              where: { id: claimRecordId },
              select: { id: true },
            });

            if (!existingClaim) {
              claimRecordId = null;
            }
          }

          if (!claimRecordId) {
            const conflictingClaim = await tx.venueClaim.findFirst({
              where: {
                venueId: existingVenue.id,
                status: {
                  in: ['pending', 'approved'],
                },
              },
              select: {
                id: true,
                claimantId: true,
              },
            });

            if (conflictingClaim && conflictingClaim.claimantId !== userId) {
              throw new Error(
                'Venue already has a pending or approved claim from another user'
              );
            }

            if (conflictingClaim && conflictingClaim.claimantId === userId) {
              claimRecordId = conflictingClaim.id;
            } else {
              const claimId = nanoid();
              const { userPassword, ...safeSubmissionData } = venueData;
              void userPassword;

              const claim = await tx.venueClaim.create({
                data: {
                  id: claimId,
                  venueId: existingVenue.id,
                  claimantId: userId,
                  status: 'pending',
                  submissionData: JSON.stringify({
                    ...safeSubmissionData,
                    mode: submissionMode,
                    submittedAt: now.toISOString(),
                  }),
                },
              });

              claimRecordId = claim.id;
            }
          }

          await tx.venue.update({
            where: { id: existingVenue.id },
            data: {
              paid: true,
              paymentDate: now,
              expiresAt,
              subscriptionId,
            },
          });

          if (subscriptionId && customerId) {
            await tx.subscription.upsert({
              where: { venueId: existingVenue.id },
              create: {
                id: nanoid(),
                venueId: existingVenue.id,
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                status: 'active',
                currentPeriodEnd: expiresAt,
              },
              update: {
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                status: 'active',
                currentPeriodEnd: expiresAt,
              },
            });
          }

          await tx.paymentIntent.update({
            where: { id: paymentRecord.id },
            data: {
              status: 'completed',
              venueId: existingVenue.id,
              venueClaimId: claimRecordId,
              paymentCompletedAt: now,
            },
          });

          processingResult = {
            alreadyProcessed: false,
            submissionMode,
            venueId: existingVenue.id,
            venueName: existingVenue.name,
            venueSlug: existingVenue.slug,
            claimId: claimRecordId ?? undefined,
            claimStatus: 'pending',
            userId,
            userEmail,
            expiresAt,
            normalizedName,
            normalizedPhone,
            tracking,
            venueData,
          };

          return;
        }

        // New venue flow
        let venueId = paymentRecord.venueId || null;
        let venueSlug: string | null = null;
        const venueNameValue =
          typeof venueData.name === 'string' ? venueData.name.trim() : '';

        if (!venueNameValue) {
          throw new Error('Venue name is required to create a new listing');
        }

        const venueName = venueNameValue;
        const addressValue = typeof venueData.address === 'string' ? venueData.address : '';
        if (!addressValue) {
          throw new Error('Venue address is required to create a new listing');
        }

        if (venueId) {
          const existingVenue = await tx.venue.findUnique({
            where: { id: venueId },
            select: { id: true, slug: true, managerId: true },
          });

          if (!existingVenue) {
            venueId = null;
          } else {
            venueSlug = existingVenue.slug;

            if (existingVenue.managerId !== userId) {
              await tx.venue.update({
                where: { id: existingVenue.id },
                data: {
                  managerId: userId,
                  updatedAt: now,
                },
              });
            }
          }
        }

        if (!venueId) {
          venueId = nanoid();
          const baseSlug = venueName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          venueSlug = `${baseSlug}-${venueId.slice(0, 8)}`;

          await tx.venue.create({
            data: {
              id: venueId,
              name: venueName,
              slug: venueSlug,
              description: venueData.description || null,
              address: addressValue,
              district: venueData.district || null,
              capacitySeated: venueData.capacitySeated || null,
              capacityStanding: venueData.capacityStanding || null,
              venueType: venueData.venueType || null,
              amenities: venueData.amenities || [],
              contactEmail: venueData.contactEmail || null,
              contactPhone: venueData.contactPhone || null,
              websiteUrl: venueData.websiteUrl || null,
              instagramUrl: venueData.instagramUrl || null,
              images: venueData.images || [],
              videoUrl: venueData.videoUrl || null,
              musicAfter10: venueData.musicAfter10 || false,
              status: 'pending',
              paid: true,
              managerId: userId,
              paymentDate: now,
              expiresAt,
              subscriptionId,
              createdAt: now,
              updatedAt: now,
            },
          });
        }

        if (subscriptionId && customerId) {
          await tx.subscription.upsert({
            where: { venueId },
            create: {
              id: nanoid(),
              venueId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              status: 'active',
              currentPeriodEnd: expiresAt,
            },
            update: {
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              status: 'active',
              currentPeriodEnd: expiresAt,
            },
          });
        }

        await tx.paymentIntent.update({
          where: { id: paymentRecord.id },
          data: {
            status: 'completed',
            venueId,
            venueClaimId: null,
            paymentCompletedAt: now,
          },
        });

        processingResult = {
          alreadyProcessed: false,
          submissionMode,
          venueId,
          venueName,
          venueSlug,
          userId,
          userEmail,
          expiresAt,
          normalizedName,
          normalizedPhone,
          tracking,
          venueData,
        };
      },
      {
        isolationLevel: 'RepeatableRead',
      }
    );
  } catch (error) {
    if (error instanceof PaymentProcessingInProgressError) {
      throw error;
    }

    console.error(
      `Failed to process venue payment for intent ${paymentIntentId} (source: ${source})`,
      error
    );
    throw error;
  }

  if (!processingResult) {
    throw new Error('Payment processing ended without a result');
  }

  const finalResult = processingResult as ProcessVenuePaymentResult;

  if (finalResult.alreadyProcessed) {
    return finalResult;
  }

  const {
    normalizedName,
    normalizedPhone,
    tracking,
    venueData,
    submissionMode,
    venueName,
    venueId,
    userId,
    userEmail,
    expiresAt,
  } = finalResult;

  const amountInCzk = (paymentIntent.amount_received ?? paymentIntent.amount) / 100;

  // Track Meta + GA4 events (best effort)
  try {
    const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
    await trackLocationRegistration(
      {
        email: userEmail,
        phone: normalizedPhone || undefined,
        firstName: firstName || undefined,
        lastName: lastNameParts.join(' ') || undefined,
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
      },
      venueName,
      request,
      tracking?.eventId
    );
  } catch (metaError) {
    console.error(
      `Failed to track Meta location registration event (${submissionMode})`,
      metaError
    );
  }

  try {
    await trackGA4ServerLocationRegistration({
      userId,
      venueName,
      venueId,
      mode: submissionMode,
      clientId: tracking?.clientId,
      eventId: tracking?.eventId,
      request,
    });
  } catch (ga4Error) {
    console.error(
      `Failed to track GA4 location registration event (${submissionMode})`,
      ga4Error
    );
  }

  try {
    const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
    await trackPayment(
      {
        email: userEmail,
        phone: normalizedPhone || undefined,
        firstName: firstName || undefined,
        lastName: lastNameParts.join(' ') || undefined,
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
      },
      amountInCzk,
      (paymentIntent.currency || 'CZK').toUpperCase(),
      request,
      tracking?.eventId
    );
  } catch (metaError) {
    console.error(`Failed to track Meta payment event (${submissionMode})`, metaError);
  }

  try {
    await trackGA4ServerPayment({
      userId,
      transactionId: paymentIntentId,
      value: amountInCzk,
      currency: (paymentIntent.currency || 'CZK').toUpperCase(),
      venueName,
      venueId,
      subscription: true,
      clientId: tracking?.clientId,
      eventId: tracking?.eventId,
      request,
    });
  } catch (ga4Error) {
    console.error(`Failed to track GA4 payment event (${submissionMode})`, ga4Error);
  }

  // Send transactional emails (best effort)
  if (submissionMode === 'claim') {
    try {
      await resend.emails.send({
        from: 'Prostormat <info@prostormat.cz>',
        to: userEmail,
        subject:
          '✅ Předplatné aktivováno - žádost o převzetí čeká na schválení administrátorem',
        html: `
          <h2>Děkujeme za aktivaci předplatného!</h2>
          <p>Vaše žádost o převzetí listingu "<strong>${venueName}</strong>" byla úspěšně odeslána.</p>

          <h3>Co bude následovat?</h3>
          <ul>
            <li>⏳ Náš tým ručně ověří, že jste oprávněný správce tohoto prostoru</li>
            <li>📬 Do 24 hodin se vám ozveme s výsledkem kontroly</li>
            <li>👩‍💻 Po schválení vám přiřadíme správu listingu</li>
          </ul>

          <h3>Detaily předplatného</h3>
          <ul>
            <li>💳 Částka: ${amountInCzk.toLocaleString('cs-CZ', { style: 'currency', currency: (paymentIntent.currency || 'CZK').toUpperCase() })}</li>
            <li>📅 Platnost do: ${expiresAt.toLocaleDateString('cs-CZ')}</li>
          </ul>

          <p>Můžete se přihlásit na: <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></p>
          <p>Děkujeme za důvěru!<br>Tým Prostormat</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send claim confirmation email:', emailError);
    }

    try {
      await resend.emails.send({
        from: 'Prostormat <info@prostormat.cz>',
        to: 'info@prostormat.cz',
        subject: '🔔 Nová žádost o převzetí listingu čeká na kontrolu',
        html: `
          <h2>Dorazila žádost o převzetí listingu</h2>
          <p><strong>Listing:</strong> ${venueName}</p>
          <p><strong>Žadatel:</strong> ${venueData.userName ? `${venueData.userName} (${userEmail})` : userEmail}</p>
          <p><strong>Adresa:</strong> ${venueData.address}</p>
          <p><strong>Platba:</strong> ✅ Přijata (${amountInCzk.toLocaleString('cs-CZ', { style: 'currency', currency: (paymentIntent.currency || 'CZK').toUpperCase() })})</p>
          <p>Na žádost je potřeba ruční kontrola do 24 hodin.</p>
          <p><a href="https://prostormat.cz/admin/venues">Otevřít administraci</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send admin claim notification:', emailError);
    }

    return processingResult;
  }

  // New venue messaging
  try {
    await resend.emails.send({
      from: 'Prostormat <info@prostormat.cz>',
      to: userEmail,
      subject: '✅ Předplatné aktivováno - váš prostor čeká na schválení',
      html: `
        <h2>Děkujeme za aktivaci předplatného!</h2>
        <p>Váš prostor "<strong>${venueName}</strong>" byl úspěšně vytvořen a je připraven k ruční kontrole.</p>

        <h3>Co bude následovat?</h3>
        <ul>
          <li>⏳ Náš tým do 24 hodin zkontroluje a schválí váš nový prostor</li>
          <li>📬 O výsledku vás budeme informovat emailem</li>
          <li>👩‍💻 Po schválení bude prostor zveřejněn a vy ho budete moci upravovat</li>
        </ul>

        <h3>Detaily předplatného</h3>
        <ul>
          <li>💳 Částka: ${amountInCzk.toLocaleString('cs-CZ', { style: 'currency', currency: (paymentIntent.currency || 'CZK').toUpperCase() })}</li>
          <li>📅 Platnost do: ${expiresAt.toLocaleDateString('cs-CZ')}</li>
        </ul>

        <p>Můžete se přihlásit na: <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></p>
        <p>Děkujeme za důvěru!<br>Tým Prostormat</p>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send new venue confirmation email:', emailError);
  }

  try {
    await resend.emails.send({
      from: 'Prostormat <info@prostormat.cz>',
      to: 'info@prostormat.cz',
      subject: '🔔 Nový prostor čeká na ruční schválení',
      html: `
        <h2>Nový prostor byl přidán a zaplacen</h2>
        <p><strong>Prostor:</strong> ${venueName}</p>
        <p><strong>Majitel:</strong> ${venueData.userName || userEmail}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Adresa:</strong> ${venueData.address}</p>
        <p><strong>Platba:</strong> ✅ Úspěšně zaplaceno (${amountInCzk.toLocaleString('cs-CZ', { style: 'currency', currency: (paymentIntent.currency || 'CZK').toUpperCase() })})</p>
        <p>Ruční schválení je potřeba provést do 24 hodin.</p>
        <p><a href="https://prostormat.cz/admin/venues">Otevřít administraci</a></p>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send admin notification for new venue:', emailError);
  }

  return processingResult;
}
