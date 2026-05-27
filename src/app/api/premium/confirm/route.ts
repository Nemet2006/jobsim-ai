import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { activatePremium, hasExistingSubscription } from '@/lib/premium'

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe konfiqurasiya edilməyib' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmalısınız' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const sessionId = body.session_id as string | undefined
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id tələb olunur' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Ödəniş tamamlanmayıb' }, { status: 400 })
  }

  const userId = session.metadata?.user_id || session.client_reference_id
  if (userId !== user.id) {
    return NextResponse.json({ error: 'Session uyğun gəlmir' }, { status: 403 })
  }

  const already = await hasExistingSubscription(user.id, sessionId)
  if (already) {
    return NextResponse.json({ ok: true, already: true })
  }

  const result = await activatePremium({
    userId: user.id,
    provider: 'stripe',
    stripeSessionId: sessionId,
    stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    amountCents: session.amount_total ?? null,
    currency: session.currency ?? 'usd',
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Aktivləşdirmə uğursuz' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
