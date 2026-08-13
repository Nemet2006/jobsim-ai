export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HRSubscriptionClient } from '@/components/hr/HRSubscriptionClient'

export default async function HRSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, company_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'hr') redirect('/login')

  return (
    <HRSubscriptionClient companyName={profile.company_name || profile.full_name || 'Şirkət'} />
  )
}
