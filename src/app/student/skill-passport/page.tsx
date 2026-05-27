export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import SkillPassportClient from '@/components/simulation/SkillPassportClient'
import type { Skill } from '@/types'

export default async function SkillPassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: passport }, { data: profile }] = await Promise.all([
    supabase.from('skill_passport').select('*').eq('student_id', user!.id).single(),
    supabase.from('users').select('full_name, university').eq('id', user!.id).single(),
  ])

  return (
    <SkillPassportClient
      skills={(passport?.skills as unknown as Skill[]) || []}
      studentName={profile?.full_name || ''}
      university={profile?.university || ''}
    />
  )
}
