import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const FREE_SIMULATION_LIMIT = 2

type Supabase = SupabaseClient<Database>

export async function canStudentAccessSimulation(
  supabase: Supabase,
  userId: string,
  simulationId: string
): Promise<{ allowed: boolean; reason: 'premium' | 'free' | 'assigned' | 'locked' }> {
  const [{ data: profile }, { data: assigned }, { data: publishedSims }] = await Promise.all([
    supabase.from('users').select('is_premium').eq('id', userId).single(),
    supabase
      .from('student_assigned_simulations')
      .select('simulation_id')
      .eq('student_id', userId)
      .eq('simulation_id', simulationId)
      .maybeSingle(),
    supabase
      .from('simulations')
      .select('id')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  if (profile?.is_premium) return { allowed: true, reason: 'premium' }
  if (assigned) return { allowed: true, reason: 'assigned' }

  const freeIds = (publishedSims || [])
    .slice(0, FREE_SIMULATION_LIMIT)
    .map((s) => s.id)

  if (freeIds.includes(simulationId)) return { allowed: true, reason: 'free' }

  return { allowed: false, reason: 'locked' }
}
