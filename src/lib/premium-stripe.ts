import type Stripe from 'stripe'
import { activatePremium, hasExistingSubscription } from '@/lib/premium'
import { parsePremiumPlan, premiumExpiryFor } from '@/lib/premium-feature'

/**
 * Grants Premium for a paid Checkout Session. Idempotent per session, so the
 * success-page confirm call and the Stripe webhook can both safely run it.
 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; already?: boolean; error?: string }> {
  if (session.payment_status !== 'paid') return { ok: false, error: 'Ödəniş tamamlanmayıb' }

  const userId = session.metadata?.user_id || session.client_reference_id
  if (!userId) return { ok: false, error: 'No user_id in session' }

  if (await hasExistingSubscription(userId, session.id)) return { ok: true, already: true }

  const plan = parsePremiumPlan(session.metadata?.plan)
  return activatePremium({
    userId,
    provider: 'stripe',
    stripeSessionId: session.id,
    stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    amountCents: session.amount_total ?? null,
    currency: session.currency ?? 'usd',
    expiresAt: premiumExpiryFor(plan),
  })
}
