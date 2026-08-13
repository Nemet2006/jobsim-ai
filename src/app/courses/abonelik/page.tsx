export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoursesSubscriptionClient } from '@/components/courses/CoursesSubscriptionClient'

export default async function CoursesSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'courses') redirect('/login')

  return (
    <CoursesSubscriptionClient instructorName={profile.full_name || 'Müəllim'} />
  )
}
