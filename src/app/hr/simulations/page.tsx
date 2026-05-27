export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import HRSimulationsClient from '@/components/hr/HRSimulationsClient'
import type { Simulation } from '@/types'

export default async function HRSimulationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: simulations } = await supabase
    .from('simulations')
    .select('*')
    .eq('created_by', user!.id)
    .order('created_at', { ascending: false })

  const simIds = simulations?.map((s) => s.id) || []
  let candidateCounts: Record<string, number> = {}
  let avgScores: Record<string, number> = {}

  if (simIds.length > 0) {
    const { data: attempts } = await supabase
      .from('simulation_attempts')
      .select('simulation_id, score, status')
      .in('simulation_id', simIds)
      .eq('status', 'completed')

    if (attempts) {
      simIds.forEach((id) => {
        const simAttempts = attempts.filter((a) => a.simulation_id === id)
        candidateCounts[id] = simAttempts.length
        avgScores[id] = simAttempts.length
          ? Math.round(simAttempts.reduce((s, a) => s + (a.score || 0), 0) / simAttempts.length)
          : 0
      })
    }
  }

  return (
    <HRSimulationsClient
      simulations={(simulations || []) as unknown as Simulation[]}
      candidateCounts={candidateCounts}
      avgScores={avgScores}
    />
  )
}
