export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import SimulationsGrid from '@/components/simulation/SimulationsGrid'
import { AssignedSimsSection } from '@/components/simulation/AssignedSimsSection'
import type { Simulation } from '@/types'

export default async function StudentSimulationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: simulations }, { data: assignedRows }, { data: attemptRows }] = await Promise.all([
    supabase.from('users').select('is_premium').eq('id', user!.id).single(),
    supabase
      .from('simulations')
      .select('*, creator:users!created_by(full_name, company_name)')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('student_assigned_simulations')
      .select('simulation_id, group_name, deadline, assigned_at')
      .eq('student_id', user!.id),
    supabase
      .from('simulation_attempts')
      .select('simulation_id')
      .eq('status', 'completed'),
  ])

  const completionCounts: Record<string, number> = {}
  for (const row of attemptRows || []) {
    completionCounts[row.simulation_id] = (completionCounts[row.simulation_id] || 0) + 1
  }

  type SimWithCreator = Simulation & { creator?: { full_name: string; company_name: string } | null }

  // Enrich assigned rows with sim details
  const assignedSimIds = [...new Set((assignedRows || []).map((r) => r.simulation_id))]
  let assignedSimDetails: (Simulation & { creator?: { full_name: string; company_name: string } | null })[] = []

  if (assignedSimIds.length > 0) {
    const { data } = await supabase
      .from('simulations')
      .select('*, creator:users!created_by(full_name, company_name)')
      .in('id', assignedSimIds)
    assignedSimDetails = (data || []) as unknown as SimWithCreator[]
  }

  // Merge deadline / group_name info
  const assignedSims = assignedSimDetails.map((sim) => {
    const rows = (assignedRows || []).filter((r) => r.simulation_id === sim.id)
    const groups = rows.map((r) => r.group_name).join(', ')
    const deadline = rows.find((r) => r.deadline)?.deadline || null
    return { ...sim, _groupName: groups, _deadline: deadline }
  })

  return (
    <div className="space-y-12">
      {/* ── Assigned by instructor ── */}
      {assignedSims.length > 0 && (
        <AssignedSimsSection sims={assignedSims} />
      )}

      {/* ── Public library ── */}
      <SimulationsGrid
        simulations={(simulations || []) as unknown as SimWithCreator[]}
        isPremium={profile?.is_premium || false}
        completionCounts={completionCounts}
      />
    </div>
  )
}
