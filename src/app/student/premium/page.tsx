export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PremiumClient } from '@/components/student/PremiumClient'
import { isStripeConfigured } from '@/lib/stripe'

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') redirect('/login')

  const promoCodes = process.env.PREMIUM_PROMO_CODES || process.env.PREMIUM_PROMO_CODE || ''
  const promoEnabled = promoCodes.trim().length > 0

  return (
    <Suspense fallback={<div className="card p-12 text-center text-ink-mid">Yüklənir…</div>}>
      <PremiumClient
        isPremium={profile?.is_premium ?? false}
        stripeEnabled={isStripeConfigured()}
        promoEnabled={promoEnabled}
        studentName={profile?.full_name || 'Tələbə'}
      />
    </Suspense>
  )
}
