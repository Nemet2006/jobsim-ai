import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'
import { ensurePlatformAdmin } from '@/lib/ensure-platform-admin'
import { resolveUserRole } from '@/lib/platform-admin'
import type { User } from '@/types'

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = resolveUserRole((profile as { role?: string } | null)?.role, user.email)
  if (!profile || role !== 'admin') redirect('/admin/login')

  if ((profile as { role: string }).role !== 'admin') {
    await ensurePlatformAdmin(user.id, user.email)
    ;(profile as { role: string }).role = 'admin'
  }

  return <AdminLayout user={profile as User}>{children}</AdminLayout>
}
