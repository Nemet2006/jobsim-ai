import { NextResponse } from 'next/server'
import { ApiError, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getStripe, getSiteUrl, isStripeConfigured } from '@/lib/stripe'
import {
  PREMIUM_FEATURE_DISABLED_MESSAGE,
  PREMIUM_FEATURE_ENABLED,
  parsePremiumPlan,
  stripePriceIdFor,
} from '@/lib/premium-feature'

export async function POST(request: Request) {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
  }

  try {
    const { user, profile } = await requireRole('student')
    const rateLimited = await enforceRateLimit(`premium-checkout:${user.id}`, 10, 3600)
    if (rateLimited) return rateLimited

    const body = await request.json().catch(() => ({}))
    const plan = parsePremiumPlan(body.plan)

    if (!isStripeConfigured(plan)) {
      throw new ApiError('Kartla ödəniş hələ qoşulmayıb. Promo kod ilə aktivləşdirin.', 503)
    }
    if (profile.is_premium) {
      throw new ApiError('Artıq Premium üzvsünüz', 400)
    }

    const siteUrl = getSiteUrl()
    const session = await getStripe()!.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: stripePriceIdFor(plan)!, quantity: 1 }],
      customer_email: profile.email || user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      success_url: `${siteUrl}/student/premium?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/student/premium?cancelled=1`,
    })

    if (!session.url) {
      throw new ApiError('Checkout yaradıla bilmədi', 500)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return jsonError(error, 'Checkout yaradıla bilmədi')
  }
}
