import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Resend webhook events we're tracking
type ResendWebhookEvent =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookPayload {
  type: ResendWebhookEvent;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce_type?: 'hard' | 'soft';
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

/**
 * Verify Resend webhook signature
 * https://resend.com/docs/dashboard/webhooks/verify-signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Handle Resend webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const payload: ResendWebhookPayload = JSON.parse(rawBody);

    // Get signature from headers
    const signature = request.headers.get('svix-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    if (signature && !verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get email ID from payload
    const emailId = payload.data.email_id;

    if (!emailId) {
      console.error('No email_id in webhook payload');
      return NextResponse.json(
        { error: 'No email_id in payload' },
        { status: 400 }
      );
    }

    // Find the broadcast log entry by Resend email ID
    const log = await prisma.venueBroadcastLog.findUnique({
      where: { resendEmailId: emailId },
    });

    if (!log) {
      console.warn(`No broadcast log found for email ID: ${emailId}`);
      // Return 200 to acknowledge webhook even if we don't have a record
      return NextResponse.json({ received: true });
    }

    // Update based on event type
    const updateData: any = {};
    const eventDate = new Date(payload.created_at);

    switch (payload.type) {
      case 'email.delivered':
        updateData.emailStatus = 'delivered';
        updateData.emailDeliveredAt = eventDate;
        break;

      case 'email.opened':
        if (!log.emailOpenedAt) {
          // First open
          updateData.emailOpenedAt = eventDate;
        }
        updateData.openCount = { increment: 1 };
        break;

      case 'email.clicked':
        if (!log.emailClickedAt) {
          // First click
          updateData.emailClickedAt = eventDate;
        }
        updateData.clickCount = { increment: 1 };
        break;

      case 'email.bounced':
        updateData.emailStatus = 'bounced';
        updateData.emailBouncedAt = eventDate;
        updateData.bounceType = payload.data.bounce_type || 'unknown';
        updateData.emailError = `Bounced (${payload.data.bounce_type || 'unknown'})`;
        break;

      case 'email.complained':
        updateData.emailStatus = 'complained';
        updateData.emailComplainedAt = eventDate;
        updateData.emailError = 'Marked as spam';
        break;

      case 'email.delivery_delayed':
        updateData.emailStatus = 'delayed';
        updateData.emailError = 'Delivery delayed';
        break;

      default:
        console.log(`Unhandled event type: ${payload.type}`);
        return NextResponse.json({ received: true });
    }

    // Update the database
    await prisma.venueBroadcastLog.update({
      where: { id: log.id },
      data: updateData,
    });

    console.log(`Webhook processed: ${payload.type} for email ${emailId}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
