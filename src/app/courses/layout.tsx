import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoursesLayout from '@/components/layout/CoursesLayout'
import type { User } from '@/types'

export default async function CoursesRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'courses') redirect('/login')

  return <CoursesLayout user={profile as User}>{children}</CoursesLayout>
}
