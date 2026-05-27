export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ResultsClient from '@/components/simulation/ResultsClient'
import type { SimulationAttempt } from '@/types'

type AttemptWithSim = SimulationAttempt & {
  simulation: {
    title: string
    role_type: string
    difficulty: string
    creator: { company_name: string | null } | null
  } | null
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string; cancelled?: string }>
}) {
  const { attempt: attemptId, cancelled } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: attempts }, { data: profile }] = await Promise.all([
    supabase
      .from('simulation_attempts')
      .select('*, simulation:simulations(title, role_type, difficulty, creator:users!created_by(company_name))')
      .eq('student_id', user!.id)
      .order('started_at', { ascending: false }),
    supabase
      .from('users')
      .select('full_name')
      .eq('id', user!.id)
      .single(),
  ])

  const highlighted = attemptId ? attempts?.find((a) => a.id === attemptId) : null
  const studentName = profile?.full_name || user!.email?.split('@')[0] || 'Tələbə'

  return (
    <ResultsClient
      attempts={(attempts || []) as unknown as AttemptWithSim[]}
      highlighted={(highlighted || null) as unknown as AttemptWithSim | null}
      showCancelled={cancelled === 'true'}
      studentName={studentName}
    />
  )
}
