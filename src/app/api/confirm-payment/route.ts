import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { resend } from '@/lib/resend';
import { trackLocationRegistration, trackPayment } from '@/lib/meta-conversions-api';
import { trackGA4ServerPayment, trackGA4ServerLocationRegistration } from '@/lib/ga4-server-tracking';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get payment record from database
    const paymentRecord = await prisma.paymentIntent.findUnique({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (paymentRecord.status === 'completed') {
      return NextResponse.json({
        message: 'Payment already processed',
        success: true,
      });
    }

    // Parse venue data
    const venueData = JSON.parse(paymentRecord.venueData);

    // Create or update user account first
    const normalizedName = typeof venueData.userName === 'string' ? venueData.userName.trim() : null;
    const normalizedPhone = typeof venueData.userPhone === 'string' ? venueData.userPhone.trim() : null;

    let userId: string;

    // Check if this is an existing user (logged in) or new user registration
    if (venueData.userId) {
      // User is logged in, use their existing account
      const existingUserById = await prisma.user.findUnique({
        where: { id: venueData.userId },
      });

      if (!existingUserById) {
        throw new Error('User account not found for provided userId');
      }

      userId = existingUserById.id;

      const userUpdateData: Record<string, unknown> = {};

      if (normalizedName && normalizedName.length > 0) {
        userUpdateData.name = normalizedName;
      }

      if (typeof venueData.userPhone === 'string') {
        userUpdateData.phone = normalizedPhone && normalizedPhone.length > 0 ? normalizedPhone : null;
      }

      if (existingUserById.role === 'user') {
        userUpdateData.role = 'venue_manager'; // Upgrade basic users only
      }

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }
    } else {
      // New user registration - need to hash password
      if (!venueData.userPassword) {
        throw new Error('Password is required for new user registration');
      }

      const hashedPassword = await bcrypt.hash(venueData.userPassword, 12);

      const existingUser = await prisma.user.findUnique({
        where: { email: venueData.userEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        const targetRole = existingUser.role === 'admin' ? existingUser.role : 'venue_manager';

        const updatedPhone = normalizedPhone === null
          ? existingUser.phone
          : normalizedPhone.length > 0
            ? normalizedPhone
            : null;

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: normalizedName && normalizedName.length > 0 ? normalizedName : existingUser.name,
            phone: updatedPhone,
            role: targetRole,
            password: hashedPassword,
          },
        });
      } else {
        userId = nanoid();

        await prisma.user.create({
          data: {
            id: userId,
            name: normalizedName && normalizedName.length > 0 ? normalizedName : null,
            email: venueData.userEmail,
            password: hashedPassword,
            phone: normalizedPhone === null ? null : normalizedPhone.length > 0 ? normalizedPhone : null,
            role: 'venue_manager',
            createdAt: new Date(),
          },
        });
      }
    }

    const now = new Date();
    const submissionMode: 'new' | 'claim' = venueData.mode === 'claim' ? 'claim' : 'new';

    if (submissionMode === 'claim') {
      if (!venueData.existingVenueId) {
        throw new Error('existingVenueId is required for claim submissions');
      }

      const existingVenue = await prisma.venue.findUnique({
        where: { id: venueData.existingVenueId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      if (!existingVenue) {
        throw new Error('Existing venue not found for claim submission');
      }

      const claimId = nanoid();
      const { userPassword, ...safeSubmissionData } = venueData
      void userPassword

      const claimRecord = await prisma.venueClaim.create({
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

      // Calculate expiry date (1 year from now)
      const expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Mark venue as paid after successful payment
      await prisma.venue.update({
        where: { id: existingVenue.id },
        data: {
          paid: true,
          paymentDate: now,
          expiresAt: expiresAt,
          subscriptionId: venueData.subscriptionId || null,
        },
      });

      // Create subscription record if we have subscription data
      if (venueData.subscriptionId && venueData.customerId) {
        try {
          await prisma.subscription.upsert({
            where: { venueId: existingVenue.id },
            create: {
              id: nanoid(),
              venueId: existingVenue.id,
              stripeSubscriptionId: venueData.subscriptionId,
              stripeCustomerId: venueData.customerId,
              status: 'active',
              currentPeriodEnd: expiresAt,
            },
            update: {
              stripeSubscriptionId: venueData.subscriptionId,
              stripeCustomerId: venueData.customerId,
              status: 'active',
              currentPeriodEnd: expiresAt,
            },
          });
        } catch (subscriptionError) {
          console.error('Failed to create subscription record for claim:', subscriptionError);
        }
      }

      await prisma.paymentIntent.update({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
        data: {
          status: 'completed',
          venueId: existingVenue.id,
          venueClaimId: claimRecord.id,
          paymentCompletedAt: now,
        },
      });

      // Track LocationRegistration event in Meta (claim mode)
      try {
        const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
        await trackLocationRegistration({
          email: venueData.userEmail,
          phone: normalizedPhone || undefined,
          firstName: firstName || undefined,
          lastName: lastNameParts.join(' ') || undefined,
        }, existingVenue.name, request);
      } catch (metaError) {
        console.error('Failed to track Meta location registration event (claim):', metaError);
      }

      // Track LocationRegistration event in GA4 (claim mode)
      try {
        await trackGA4ServerLocationRegistration({
          userId: userId,
          venueName: existingVenue.name,
          venueId: existingVenue.id,
          mode: 'claim',
          request,
        });
      } catch (ga4Error) {
        console.error('Failed to track GA4 location registration event (claim):', ga4Error);
      }

      // Track Payment event in Meta (claim mode)
      try {
        const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
        await trackPayment({
          email: venueData.userEmail,
          phone: normalizedPhone || undefined,
          firstName: firstName || undefined,
          lastName: lastNameParts.join(' ') || undefined,
        }, paymentIntent.amount / 100, 'CZK', request);
      } catch (metaError) {
        console.error('Failed to track Meta payment event (claim):', metaError);
      }

      // Track Payment event in GA4 (claim mode)
      try {
        await trackGA4ServerPayment({
          userId: userId,
          transactionId: paymentIntentId,
          value: paymentIntent.amount / 100,
          currency: 'CZK',
          venueName: existingVenue.name,
          venueId: existingVenue.id,
          subscription: true,
          request,
        });
      } catch (ga4Error) {
        console.error('Failed to track GA4 payment event (claim):', ga4Error);
      }

      // Notify user about claim submission
      try {
        await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: venueData.userEmail,
          subject: '✅ Předplatné aktivováno - žádost o převzetí čeká na schválení',
          html: `
            <h2>Děkujeme za aktivaci předplatného!</h2>
            <p>Vaše žádost o převzetí listingu "<strong>${existingVenue.name}</strong>" byla úspěšně odeslána.</p>

            <h3>Detaily předplatného</h3>
            <ul>
              <li>💳 Částka: 12,000 CZK/rok</li>
              <li>📅 Platnost do: ${expiresAt.toLocaleDateString('cs-CZ')}</li>
              <li>🔄 Automatické obnovení: Ano</li>
            </ul>

            <h3>Co bude následovat?</h3>
            <ul>
              <li>✅ Potvrdíme, že jste oprávněný správce tohoto prostoru</li>
              <li>⏳ Administrátor žádost zkontroluje a přiřadí vám správu</li>
              <li>📧 Po schválení obdržíte potvrzení emailem</li>
              <li>🛠️ Poté budete moci listing upravovat a řídit rezervace</li>
            </ul>
            <p>Můžete se přihlásit na: <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></p>
            <p>Děkujeme za důvěru!<br>Tým Prostormat</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send claim confirmation email:', emailError);
      }

      // Notify admin about claim request
      try {
        await resend.emails.send({
          from: 'Prostormat <noreply@prostormat.cz>',
          to: 'info@prostormat.cz',
          subject: '🔔 Nová žádost o převzetí listingu',
          html: `
            <h2>Dorazila žádost o převzetí listingu</h2>
            <p><strong>Listing:</strong> ${existingVenue.name}</p>
            <p><strong>Žadatel:</strong> ${venueData.userName || 'Neuvedeno'} (${venueData.userEmail})</p>
            <p><strong>Adresa:</strong> ${venueData.address}</p>
            <p><strong>Platba:</strong> ✅ Přijata (12,000 CZK)</p>
            <p>Žádost je k dispozici v administraci v detailu listingu.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send admin claim notification:', emailError);
      }

      // Log email activity
      try {
        await prisma.emailFlowLog.create({
          data: {
            id: nanoid(),
            emailType: 'venue_claim_confirmation',
            recipient: venueData.userEmail,
            subject: 'Platba přijata - žádost o převzetí čeká na schválení',
            status: 'sent',
            recipientType: 'venue_owner',
            sentBy: userId,
            createdAt: now,
          },
        });
      } catch (logError) {
        console.error('Failed to log claim email activity:', logError);
      }

      return NextResponse.json({
        message: 'Claim submitted and payment confirmed',
        success: true,
        venueId: existingVenue.id,
        claimId: claimId,
        userId,
      });
    }

    // Create venue (status: pending approval)
    const venueId = nanoid();
    const venueSlug = venueData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Calculate expiry date (1 year from now)
    const venueExpiresAt = new Date(now);
    venueExpiresAt.setFullYear(venueExpiresAt.getFullYear() + 1);

    await prisma.venue.create({
      data: {
        id: venueId,
        name: venueData.name,
        slug: `${venueSlug}-${venueId.slice(0, 8)}`,
        description: venueData.description || null,
        address: venueData.address,
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
        status: 'pending', // Requires admin approval
        paid: true, // Mark as paid after successful payment
        managerId: userId,
        paymentDate: now,
        expiresAt: venueExpiresAt,
        subscriptionId: venueData.subscriptionId || null,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create subscription record if we have subscription data
    if (venueData.subscriptionId && venueData.customerId) {
      try {
        await prisma.subscription.create({
          data: {
            id: nanoid(),
            venueId: venueId,
            stripeSubscriptionId: venueData.subscriptionId,
            stripeCustomerId: venueData.customerId,
            status: 'active',
            currentPeriodEnd: venueExpiresAt,
          },
        });
      } catch (subscriptionError) {
        console.error('Failed to create subscription record:', subscriptionError);
      }
    }

    // Update payment record
    await prisma.paymentIntent.update({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      data: {
        status: 'completed',
        venueId: venueId,
        paymentCompletedAt: now,
      },
    });

    // Track LocationRegistration event in Meta (new venue)
    try {
      const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
      await trackLocationRegistration({
        email: venueData.userEmail,
        phone: normalizedPhone || undefined,
        firstName: firstName || undefined,
        lastName: lastNameParts.join(' ') || undefined,
      }, venueData.name, request);
    } catch (metaError) {
      console.error('Failed to track Meta location registration event (new):', metaError);
    }

    // Track LocationRegistration event in GA4 (new venue)
    try {
      await trackGA4ServerLocationRegistration({
        userId: userId,
        venueName: venueData.name,
        venueId: venueId,
        mode: 'new',
        request,
      });
    } catch (ga4Error) {
      console.error('Failed to track GA4 location registration event (new):', ga4Error);
    }

    // Track Payment event in Meta (new venue)
    try {
      const [firstName, ...lastNameParts] = (normalizedName || '').split(' ');
      await trackPayment({
        email: venueData.userEmail,
        phone: normalizedPhone || undefined,
        firstName: firstName || undefined,
        lastName: lastNameParts.join(' ') || undefined,
      }, paymentIntent.amount / 100, 'CZK', request);
    } catch (metaError) {
      console.error('Failed to track Meta payment event (new):', metaError);
    }

    // Track Payment event in GA4 (new venue)
    try {
      await trackGA4ServerPayment({
        userId: userId,
        transactionId: paymentIntentId,
        value: paymentIntent.amount / 100,
        currency: 'CZK',
        venueName: venueData.name,
        venueId: venueId,
        subscription: true,
        request,
      });
    } catch (ga4Error) {
      console.error('Failed to track GA4 payment event (new):', ga4Error);
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: venueData.userEmail,
        subject: '✅ Předplatné aktivováno - Prostor čeká na schválení',
        html: `
          <h2>Děkujeme za aktivaci předplatného!</h2>
          <p>Vaše předplatné pro prostor "<strong>${venueData.name}</strong>" bylo úspěšně aktivováno.</p>

          <h3>Detaily předplatného</h3>
          <ul>
            <li>💳 Částka: 12,000 CZK/rok</li>
            <li>📅 Platnost do: ${venueExpiresAt.toLocaleDateString('cs-CZ')}</li>
            <li>🔄 Automatické obnovení: Ano (každý rok)</li>
          </ul>

          <h3>Co bude dále?</h3>
          <ul>
            <li>✅ Váš účet byl vytvořen</li>
            <li>⏳ Váš prostor čeká na schválení administrátorem</li>
            <li>📧 Po schválení vám pošleme email a prostor se zpřístupní</li>
            <li>✏️ Po přihlášení můžete prostor ihned upravovat v administraci</li>
            <li>🎯 Pak budete moci přijímat rezervace!</li>
          </ul>

          <p><strong>Přihlašovací údaje:</strong></p>
          <ul>
            <li>Email: ${venueData.userEmail}</li>
            <li>Heslo: (které jste si zvolili při registraci)</li>
          </ul>

          <p>Můžete se přihlásit na: <a href="https://prostormat.cz/prihlaseni">prostormat.cz/prihlaseni</a></p>

          <p><small>Poznámka: Předplatné se automaticky obnoví za rok. Můžete ho kdykoliv zrušit v nastavení vašeho účtu.</small></p>

          <p>Děkujeme za důvěru!<br>Tým Prostormat</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the whole process if email fails
    }

    // Send notification to admin
    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: 'info@prostormat.cz',
        subject: '🔔 Nový prostor čeká na schválení',
        html: `
          <h2>Nový prostor byl přidán a zaplacen</h2>
          <p><strong>Prostor:</strong> ${venueData.name}</p>
          <p><strong>Majitel:</strong> ${venueData.userName}</p>
          <p><strong>Email:</strong> ${venueData.userEmail}</p>
          <p><strong>Adresa:</strong> ${venueData.address}</p>
          <p><strong>Platba:</strong> ✅ Úspěšně zaplaceno (12,000 CZK)</p>
          
          <p>Prostor čeká na schválení v admin dashboardu.</p>
          
          <p><a href="https://prostormat.cz/dashboard">Schválit prostor</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Log the email activity (best-effort)
    try {
      await prisma.emailFlowLog.create({
        data: {
          id: nanoid(),
          emailType: 'venue_payment_confirmation',
          recipient: venueData.userEmail,
          subject: 'Platba úspěšně přijata - Prostor čeká na schválení',
          status: 'sent',
          recipientType: 'venue_owner',
          sentBy: userId,
          createdAt: now,
        },
      });
    } catch (logError) {
      console.error('Failed to log email activity:', logError);
    }

    return NextResponse.json({
      message: 'Payment confirmed and venue created successfully',
      success: true,
      venueId,
      userId,
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}
