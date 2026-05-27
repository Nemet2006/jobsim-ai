import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, getSiteUrl, isStripeConfigured } from '@/lib/stripe'

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe konfiqurasiya edilməyib. PREMIUM_PROMO_CODE ilə aktivləşdirin.' },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmalısınız' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, email, full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') {
    return NextResponse.json({ error: 'Premium yalnız tələbələr üçündür' }, { status: 403 })
  }

  if (profile?.is_premium) {
    return NextResponse.json({ error: 'Artıq Premium üzvsünüz' }, { status: 400 })
  }

  const stripe = getStripe()!
  const siteUrl = getSiteUrl()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: profile?.email || user.email,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan: 'premium',
    },
    success_url: `${siteUrl}/student/premium?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/student/premium?cancelled=1`,
  })

  if (!session.url) {
    return NextResponse.json({ error: 'Checkout yaradıla bilmədi' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
