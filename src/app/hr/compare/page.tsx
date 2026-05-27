export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import CompareClient from '@/components/hr/CompareClient'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const idList = ids?.split(',').filter(Boolean) || []

  type CandidateCompare = {
    shortlist_id: string
    score: number | null
    ai_analysis: Record<string, unknown> | null
    student_name: string
    university: string | null
    role_type: string
  }

  const candidates: CandidateCompare[] = []

  for (const slId of idList.slice(0, 4)) {
    const { data: item } = await supabase
      .from('shortlist')
      .select('id, student_id, simulation_id, attempt_id')
      .eq('id', slId)
      .eq('hr_id', user!.id)
      .single()

    if (!item) continue

    const [{ data: student }, { data: simulation }, { data: attempt }] = await Promise.all([
      supabase.from('users').select('full_name, university').eq('id', item.student_id).single(),
      supabase.from('simulations').select('role_type').eq('id', item.simulation_id).single(),
      supabase.from('simulation_attempts').select('score, ai_analysis').eq('id', item.attempt_id).single(),
    ])

    candidates.push({
      shortlist_id: item.id,
      score: attempt?.score ?? null,
      ai_analysis: attempt?.ai_analysis as Record<string, unknown> | null,
      student_name: student?.full_name || 'Namizəd',
      university: student?.university || null,
      role_type: simulation?.role_type || '',
    })
  }

  return <CompareClient candidates={candidates} />
}
