import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/** @deprecated Premium gate disabled — all published simulations are open. */
export const FREE_SIMULATION_LIMIT = Number.POSITIVE_INFINITY

type Supabase = SupabaseClient<Database>

/**
 * Premium subscription gate is currently disabled.
 * All published simulations are open to every student.
 */
export async function canStudentAccessSimulation(
  _supabase: Supabase,
  _userId: string,
  _simulationId: string
): Promise<{ allowed: boolean; reason: 'open' | 'premium' | 'free' | 'assigned' | 'locked' }> {
  return { allowed: true, reason: 'open' }
}
