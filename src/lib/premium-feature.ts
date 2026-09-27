/**
 * Premium checkout / promo activation is opt-in per deployment.
 * Set NEXT_PUBLIC_PREMIUM_ENABLED=true (plus Stripe and/or promo env vars) to turn it on;
 * until then every simulation stays free and the pricing page is informational.
 */
export const PREMIUM_FEATURE_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === 'true'

export const PREMIUM_FEATURE_DISABLED_MESSAGE =
  'Premium abunəlik hələ aktiv deyil. Bu funksiya yaxın zamanda aktivləşəcək.'

export type PremiumPlan = 'monthly' | 'yearly'

export function parsePremiumPlan(value: unknown): PremiumPlan {
  return value === 'yearly' || value === 'b2c-yearly' ? 'yearly' : 'monthly'
}

/** Stripe Price for the plan; falls back to the legacy single STRIPE_PRICE_ID. */
export function stripePriceIdFor(plan: PremiumPlan): string | undefined {
  const specific = plan === 'yearly' ? process.env.STRIPE_PRICE_ID_YEARLY : process.env.STRIPE_PRICE_ID_MONTHLY
  return specific || process.env.STRIPE_PRICE_ID
}

/** One-time payments grant access for the paid period. */
export function premiumExpiryFor(plan: PremiumPlan, from = new Date()): string {
  const d = new Date(from)
  if (plan === 'yearly') d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  return d.toISOString()
}
