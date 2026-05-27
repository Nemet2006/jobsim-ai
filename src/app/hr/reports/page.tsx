export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ReportsClient from '@/components/hr/ReportsClient'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: simulations }] = await Promise.all([
    supabase.from('users').select('company_name, full_name').eq('id', user!.id).single(),
    supabase.from('simulations').select('id, title, role_type').eq('created_by', user!.id),
  ])

  const simIds = (simulations || []).map((s) => s.id)

  type AttemptData = {
    score: number | null
    started_at: string
    simulation_id: string
    student_id: string
    student_name: string
    university: string | null
  }

  let attemptData: AttemptData[] = []
  let shortlistCount = 0

  if (simIds.length > 0) {
    const [{ data: attempts }, { data: sl }] = await Promise.all([
      supabase
        .from('simulation_attempts')
        .select('score, started_at, simulation_id, student_id')
        .in('simulation_id', simIds)
        .eq('status', 'completed'),
      supabase.from('shortlist').select('id').eq('hr_id', user!.id),
    ])
    shortlistCount = sl?.length || 0

    for (const a of attempts || []) {
      const { data: studentData } = await supabase.from('users').select('full_name, university').eq('id', a.student_id).single()
      attemptData.push({
        score: a.score,
        started_at: a.started_at,
        simulation_id: a.simulation_id,
        student_id: a.student_id,
        student_name: studentData?.full_name || 'Namizəd',
        university: studentData?.university || null,
      })
    }
  }

  return (
    <ReportsClient
      companyName={profile?.company_name || profile?.full_name || 'Şirkət'}
      simulations={simulations || []}
      attempts={attemptData}
      shortlistCount={shortlistCount}
    />
  )
}
