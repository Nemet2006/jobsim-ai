import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { activatePremium, hasExistingSubscription } from '@/lib/premium'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook konfiqurasiya edilməyib' }, { status: 503 })
  }

  const body = await request.text()
  const sig = (await headers()).get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata?.user_id || session.client_reference_id
    if (!userId) {
      return NextResponse.json({ error: 'No user_id in session' }, { status: 400 })
    }

    const sessionId = session.id
    const already = await hasExistingSubscription(userId, sessionId)
    if (!already) {
      await activatePremium({
        userId,
        provider: 'stripe',
        stripeSessionId: sessionId,
        stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amountCents: session.amount_total ?? null,
        currency: session.currency ?? 'usd',
      })
    }
  }

  return NextResponse.json({ received: true })
}
