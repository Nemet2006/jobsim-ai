import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HRLayout from '@/components/layout/HRLayout'
import type { User } from '@/types'

export default async function HRRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'hr') redirect('/login')

  return <HRLayout user={profile as User}>{children}</HRLayout>
}
