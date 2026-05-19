import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 });
    }

    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: { user_id: userId },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[checkout] Lemon Squeezy error:', data);
      return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 });
    }

    const checkoutUrl = data.data.attributes.url;
    return NextResponse.json({ url: checkoutUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
