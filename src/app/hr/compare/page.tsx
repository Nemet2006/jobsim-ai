export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { LazyCompareClient as CompareClient } from '@/components/charts/lazy'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const idList = [...new Set((ids?.split(',').filter(Boolean) || []).slice(0, 4))]

  type CandidateCompare = {
    shortlist_id: string
    score: number | null
    ai_analysis: Record<string, unknown> | null
    student_name: string
    university: string | null
    role_type: string
  }

  if (idList.length === 0) {
    return <CompareClient candidates={[]} />
  }

  const { data: shortlistItems } = await supabase
    .from('shortlist')
    .select('id, student_id, simulation_id, attempt_id')
    .eq('hr_id', user!.id)
    .in('id', idList)

  const items = shortlistItems || []
  if (items.length === 0) {
    return <CompareClient candidates={[]} />
  }

  const studentIds = [...new Set(items.map((i) => i.student_id))]
  const simIds = [...new Set(items.map((i) => i.simulation_id))]
  const attemptIds = [...new Set(items.map((i) => i.attempt_id))]

  const [{ data: students }, { data: simulations }, { data: attempts }] = await Promise.all([
    supabase.from('users').select('id, full_name, university').in('id', studentIds),
    supabase.from('simulations').select('id, role_type').in('id', simIds),
    supabase.from('simulation_attempts').select('id, score, ai_analysis').in('id', attemptIds),
  ])

  const studentById = new Map((students || []).map((s) => [s.id, s]))
  const simById = new Map((simulations || []).map((s) => [s.id, s]))
  const attemptById = new Map((attempts || []).map((a) => [a.id, a]))

  const order = new Map(idList.map((id, i) => [id, i]))
  const candidates: CandidateCompare[] = items
    .slice()
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
    .map((item) => {
      const student = studentById.get(item.student_id)
      const simulation = simById.get(item.simulation_id)
      const attempt = attemptById.get(item.attempt_id)
      return {
        shortlist_id: item.id,
        score: attempt?.score ?? null,
        ai_analysis: (attempt?.ai_analysis as Record<string, unknown> | null) ?? null,
        student_name: student?.full_name || 'Namizəd',
        university: student?.university || null,
        role_type: simulation?.role_type || '',
      }
    })

  return <CompareClient candidates={candidates} />
}
