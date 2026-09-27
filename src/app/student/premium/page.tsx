export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PremiumClient } from '@/components/student/PremiumClient'
import { PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

type SearchParams = Promise<{ success?: string; session_id?: string; cancelled?: string }>

export default async function PremiumPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role, is_premium')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') redirect('/login')

  const params = await searchParams

  return (
    <Suspense fallback={<div className="card p-12 text-center text-ink-mid">Yüklənir…</div>}>
      <PremiumClient
        studentName={profile?.full_name || 'Tələbə'}
        premiumEnabled={PREMIUM_FEATURE_ENABLED}
        isPremium={Boolean(profile?.is_premium)}
        checkoutSessionId={params.success === '1' && params.session_id ? params.session_id : null}
        checkoutCancelled={params.cancelled === '1'}
      />
    </Suspense>
  )
}
