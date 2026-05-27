export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import CandidatesClient from '@/components/hr/CandidatesClient'

export default async function CandidatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: hrSims } = await supabase
    .from('simulations')
    .select('id, title')
    .eq('created_by', user!.id)

  const simIds = (hrSims || []).map((s) => s.id)

  type Candidate = {
    attempt_id: string
    student_id: string
    simulation_id: string
    score: number | null
    started_at: string
    ai_analysis: Record<string, unknown> | null
    student_name: string
    university: string | null
    simulation_title: string
    is_shortlisted: boolean
  }

  const candidates: Candidate[] = []

  if (simIds.length > 0) {
    const [{ data: attempts }, { data: shortlisted }] = await Promise.all([
      supabase
        .from('simulation_attempts')
        .select('id, simulation_id, student_id, score, started_at, ai_analysis')
        .in('simulation_id', simIds)
        .eq('status', 'completed')
        .order('started_at', { ascending: false }),
      supabase.from('shortlist').select('attempt_id').eq('hr_id', user!.id),
    ])

    const shortlistedIds = new Set((shortlisted || []).map((s) => s.attempt_id))

    for (const a of attempts || []) {
      const [{ data: studentData }, { data: simData }] = await Promise.all([
        supabase.from('users').select('full_name, university').eq('id', a.student_id).single(),
        supabase.from('simulations').select('title').eq('id', a.simulation_id).single(),
      ])
      candidates.push({
        attempt_id: a.id,
        student_id: a.student_id,
        simulation_id: a.simulation_id,
        score: a.score,
        started_at: a.started_at,
        ai_analysis: a.ai_analysis as Record<string, unknown> | null,
        student_name: studentData?.full_name || 'Namizəd',
        university: studentData?.university || null,
        simulation_title: simData?.title || '',
        is_shortlisted: shortlistedIds.has(a.id),
      })
    }
  }

  return <CandidatesClient candidates={candidates} hrId={user!.id} />
}
