export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ShortlistClient from '@/components/hr/ShortlistClient'

export default async function ShortlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shortlist } = await supabase
    .from('shortlist')
    .select('id, attempt_id, student_id, simulation_id, added_at')
    .eq('hr_id', user!.id)
    .order('added_at', { ascending: false })

  const items = []
  for (const s of shortlist || []) {
    const [{ data: student }, { data: simulation }, { data: attempt }] = await Promise.all([
      supabase.from('users').select('id, full_name, university').eq('id', s.student_id).single(),
      supabase.from('simulations').select('title, role_type').eq('id', s.simulation_id).single(),
      supabase.from('simulation_attempts').select('score, ai_analysis').eq('id', s.attempt_id).single(),
    ])
    items.push({
      id: s.id,
      attempt_id: s.attempt_id,
      student: student ? { id: student.id, full_name: student.full_name, university: student.university } : null,
      simulation: simulation ? { title: simulation.title, role_type: simulation.role_type } : null,
      attempt: attempt ? { score: attempt.score, ai_analysis: attempt.ai_analysis as Record<string, unknown> | null } : null,
    })
  }

  return <ShortlistClient items={items} hrId={user!.id} />
}
