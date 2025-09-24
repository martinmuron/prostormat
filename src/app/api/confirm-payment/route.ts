import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { resend } from '@/lib/resend';

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

    // Create venue (status: pending approval)
    const venueId = nanoid();
    const venueSlug = venueData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

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
        managerId: userId,
        paymentDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update payment record
    await prisma.paymentIntent.update({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      data: {
        status: 'completed',
        venueId: venueId,
        paymentCompletedAt: new Date(),
      },
    });

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'Prostormat <noreply@prostormat.cz>',
        to: venueData.userEmail,
        subject: '✅ Platba úspěšně přijata - Prostor čeká na schválení',
        html: `
          <h2>Děkujeme za platbu!</h2>
          <p>Vaše platba za přidání prostoru "<strong>${venueData.name}</strong>" byla úspěšně přijata.</p>
          
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
          createdAt: new Date(),
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
