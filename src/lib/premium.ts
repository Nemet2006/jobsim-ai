import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin credentials not configured')
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface ActivatePremiumParams {
  userId: string
  provider: 'stripe' | 'promo' | 'admin'
  stripeSessionId?: string | null
  stripePaymentId?: string | null
  promoCode?: string | null
  amountCents?: number | null
  currency?: string
  expiresAt?: string | null
}

export async function activatePremium(params: ActivatePremiumParams): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient()

  const { error } = await admin.rpc('activate_user_premium', {
    p_user_id: params.userId,
    p_provider: params.provider,
    p_stripe_session_id: params.stripeSessionId ?? null,
    p_stripe_payment_id: params.stripePaymentId ?? null,
    p_promo_code: params.promoCode ?? null,
    p_amount_cents: params.amountCents ?? null,
    p_currency: params.currency ?? 'usd',
    p_expires_at: params.expiresAt ?? null,
  })

  if (error) {
    // Fallback if RPC not deployed yet — direct update
    const { error: updateErr } = await admin
      .from('users')
      .update({ is_premium: true })
      .eq('id', params.userId)

    if (updateErr) return { ok: false, error: updateErr.message }

    await admin.from('premium_subscriptions').insert({
      user_id: params.userId,
      status: 'active',
      plan: 'premium',
      provider: params.provider,
      stripe_session_id: params.stripeSessionId ?? null,
      stripe_payment_id: params.stripePaymentId ?? null,
      promo_code: params.promoCode ?? null,
      amount_cents: params.amountCents ?? null,
      currency: params.currency ?? 'usd',
      expires_at: params.expiresAt ?? null,
    }).then(() => {}) // ignore if table missing

    return { ok: true }
  }

  return { ok: true }
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin.from('users').select('is_premium').eq('id', userId).single()
  return data?.is_premium ?? false
}

export async function hasExistingSubscription(userId: string, stripeSessionId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('premium_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle()
  return Boolean(data)
}
