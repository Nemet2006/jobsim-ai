import { NextResponse } from 'next/server'
import { ApiError, jsonError, requireRole } from '@/lib/api-auth'
import { getStripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/premium-stripe'
import { PREMIUM_FEATURE_DISABLED_MESSAGE, PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

/** Called by /student/premium?success=1 so access is granted even if the webhook is delayed. */
export async function POST(request: Request) {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
  }

  try {
    const stripe = getStripe()
    if (!stripe) throw new ApiError('Stripe konfiqurasiya edilməyib', 503)

    const { user } = await requireRole('student')
    const body = await request.json().catch(() => ({}))
    const sessionId = String(body.session_id ?? '')
    if (!/^cs_[A-Za-z0-9_]{8,200}$/.test(sessionId)) {
      throw new ApiError('session_id tələb olunur', 400)
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const owner = session.metadata?.user_id || session.client_reference_id
    if (owner !== user.id) throw new ApiError('Session uyğun gəlmir', 403)

    const result = await fulfillCheckoutSession(session)
    if (!result.ok) throw new ApiError(result.error || 'Aktivləşdirmə uğursuz', 400)

    return NextResponse.json({ ok: true, already: Boolean(result.already) })
  } catch (error) {
    return jsonError(error, 'Aktivləşdirmə uğursuz')
  }
}
