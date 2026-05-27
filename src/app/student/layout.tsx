import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentLayout from '@/components/layout/StudentLayout'
import type { User } from '@/types'

export default async function StudentRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'student') redirect('/login')

  return <StudentLayout user={profile as User}>{children}</StudentLayout>
}
