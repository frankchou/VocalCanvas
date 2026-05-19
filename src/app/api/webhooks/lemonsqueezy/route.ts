import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') ?? '';

    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    const userId = event.meta?.custom_data?.user_id;

    if (!userId) {
      console.warn('[webhook] No user_id in custom_data');
      return NextResponse.json({ ok: true });
    }

    const userRef = adminDb.doc(`users/${userId}`);

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_resumed':
        await userRef.update({
          plan: 'pro',
          'usage.total': 14400, // 240 minutes in seconds
        });
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await userRef.update({
          plan: 'free',
          'usage.total': 1800, // 30 minutes in seconds
        });
        break;

      case 'subscription_updated':
        // Handle plan changes if needed
        break;

      default:
        console.log(`[webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
