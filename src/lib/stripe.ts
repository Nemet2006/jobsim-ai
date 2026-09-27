import Stripe from 'stripe'
import { getPublicSiteUrl } from '@/lib/site-url'
import { stripePriceIdFor, type PremiumPlan } from '@/lib/premium-feature'

let stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!stripe) {
    stripe = new Stripe(key)
  }
  return stripe
}

export function isStripeConfigured(plan: PremiumPlan = 'monthly'): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && stripePriceIdFor(plan))
}

export function getSiteUrl(): string {
  return getPublicSiteUrl()
}
