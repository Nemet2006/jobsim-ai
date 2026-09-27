import { NextResponse } from 'next/server'
import { ApiError, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { activatePremium } from '@/lib/premium'
import { PREMIUM_FEATURE_DISABLED_MESSAGE, PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

/** Promo-code activation. Codes come from PREMIUM_PROMO_CODES (comma-separated). */
export async function POST(request: Request) {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
  }

  try {
    const { user, profile } = await requireRole('student')
    // Tight limit: promo codes must not be brute-forceable.
    const rateLimited = await enforceRateLimit(`premium-promo:${user.id}`, 5, 3600)
    if (rateLimited) return rateLimited

    if (profile.is_premium) {
      return NextResponse.json({ ok: true, already: true })
    }

    const body = await request.json().catch(() => ({}))
    const code = String(body.code ?? '').trim().toUpperCase()
    if (!code || code.length > 64) {
      throw new ApiError('Promo kod daxil edin', 400)
    }

    const validCodes = (process.env.PREMIUM_PROMO_CODES || process.env.PREMIUM_PROMO_CODE || '')
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)

    if (validCodes.length === 0) {
      throw new ApiError('Promo kod sistemi aktiv deyil', 503)
    }
    if (!validCodes.includes(code)) {
      throw new ApiError('Yanlış promo kod', 400)
    }

    const result = await activatePremium({ userId: user.id, provider: 'promo', promoCode: code })
    if (!result.ok) {
      throw new ApiError(result.error || 'Aktivləşdirmə uğursuz', 500)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'Aktivləşdirmə uğursuz')
  }
}
