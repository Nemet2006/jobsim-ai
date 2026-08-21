export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensurePlatformAdmin } from '@/lib/ensure-platform-admin'
import { resolveUserRole } from '@/lib/platform-admin'
import type { UserRole } from '@/types'
import LandingPage from '@/components/landing/LandingPage'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  student: '/student/dashboard',
  hr: '/hr/dashboard',
  courses: '/courses/dashboard',
  admin: '/admin/dashboard',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = resolveUserRole(profile?.role, user.email)
    if (role === 'admin' && profile?.role !== 'admin') {
      await ensurePlatformAdmin(user.id, user.email)
    }
    if (role) {
      redirect(ROLE_REDIRECTS[role])
    }
  }

  return <LandingPage />
}
