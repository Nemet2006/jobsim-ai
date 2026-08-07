export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PremiumClient } from '@/components/student/PremiumClient'

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') redirect('/login')

  return (
    <Suspense fallback={<div className="card p-12 text-center text-ink-mid">Yüklənir…</div>}>
      <PremiumClient studentName={profile?.full_name || 'Tələbə'} />
    </Suspense>
  )
}
