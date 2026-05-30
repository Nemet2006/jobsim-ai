import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { activatePremium } from '@/lib/premium'
import { getClientIp } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rateLimited = await enforceRateLimit(`premium-activate:${ip}`, 10, 3600)
  if (rateLimited) return rateLimited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmalısınız' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') {
    return NextResponse.json({ error: 'Premium yalnız tələbələr üçündür' }, { status: 403 })
  }

  if (profile?.is_premium) {
    return NextResponse.json({ ok: true, already: true })
  }

  const body = await request.json().catch(() => ({}))
  const code = (body.code as string | undefined)?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: 'Promo kod daxil edin' }, { status: 400 })
  }

  const validCodes = (process.env.PREMIUM_PROMO_CODES || process.env.PREMIUM_PROMO_CODE || '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)

  if (validCodes.length === 0) {
    return NextResponse.json({ error: 'Promo kod sistemi aktiv deyil' }, { status: 503 })
  }

  if (!validCodes.includes(code)) {
    return NextResponse.json({ error: 'Yanlış promo kod' }, { status: 400 })
  }

  const result = await activatePremium({
    userId: user.id,
    provider: 'promo',
    promoCode: code,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Aktivləşdirmə uğursuz' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
