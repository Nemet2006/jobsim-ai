import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/premium-stripe'
import { PREMIUM_FEATURE_DISABLED_MESSAGE, PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json(
      { received: true, ignored: true, message: PREMIUM_FEATURE_DISABLED_MESSAGE },
      { status: 200 }
    )
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook konfiqurasiya edilməyib' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const result = await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session)
    // A non-paid session is not an error for Stripe; only real failures should trigger a retry.
    if (!result.ok && result.error !== 'Ödəniş tamamlanmayıb') {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
