import { createAdminClient } from '@/lib/premium'
import { localizeSimulation } from '@/lib/localize-simulation'
import { certificateIdToUuidRange, normalizeCertificateId } from '@/lib/certificate-id'
import type { Locale } from '@/i18n/config'
import type { Difficulty, QuestionType } from '@/types'

/**
 * Read-only data for public (logged-out) pages. Uses the service role on the server,
 * so every query here must select only fields that are safe to show to anyone.
 */

function adminOrNull() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

export interface PublicSimulation {
  id: string
  title: string
  description: string
  roleType: string
  difficulty: Difficulty
  durationMinutes: number
  companyName: string | null
  questionCount: number
  taskMix: Partial<Record<QuestionType, number>>
  completions: number
  createdAt: string
}

interface SimRow {
  id: string
  title: string
  description: string
  role_type: string
  difficulty: Difficulty
  duration_minutes: number
  questions: unknown
  created_at: string
  creator: { company_name: string | null } | null
}

function toPublicSimulation(row: SimRow, locale: Locale, completions: number): PublicSimulation {
  const loc = localizeSimulation(row, locale)
  const taskMix: Partial<Record<QuestionType, number>> = {}
  for (const q of loc.questions) taskMix[q.type] = (taskMix[q.type] || 0) + 1
  return {
    id: row.id,
    title: loc.title,
    description: loc.description,
    roleType: loc.role_type,
    difficulty: row.difficulty,
    durationMinutes: row.duration_minutes,
    companyName: row.creator?.company_name || null,
    questionCount: loc.questions.length,
    taskMix,
    completions,
    createdAt: row.created_at,
  }
}

const SIM_FIELDS =
  'id, title, description, role_type, difficulty, duration_minutes, questions, created_at, creator:users!created_by(company_name)'

async function completionCounts(simulationIds: string[]): Promise<Record<string, number>> {
  const admin = adminOrNull()
  if (!admin || simulationIds.length === 0) return {}
  const { data } = await admin
    .from('simulation_attempts')
    .select('simulation_id')
    .eq('status', 'completed')
    .in('simulation_id', simulationIds)
  const counts: Record<string, number> = {}
  for (const row of data || []) counts[row.simulation_id] = (counts[row.simulation_id] || 0) + 1
  return counts
}

export async function listPublicSimulations(locale: Locale): Promise<PublicSimulation[]> {
  const admin = adminOrNull()
  if (!admin) return []
  const { data, error } = await admin
    .from('simulations')
    .select(SIM_FIELDS)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  const rows = data as unknown as SimRow[]
  const counts = await completionCounts(rows.map((r) => r.id))
  return rows.map((r) => toPublicSimulation(r, locale, counts[r.id] || 0))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getPublicSimulation(id: string, locale: Locale): Promise<PublicSimulation | null> {
  if (!UUID_RE.test(id)) return null
  const admin = adminOrNull()
  if (!admin) return null
  const { data, error } = await admin
    .from('simulations')
    .select(SIM_FIELDS)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error || !data) return null
  const counts = await completionCounts([id])
  return toPublicSimulation(data as unknown as SimRow, locale, counts[id] || 0)
}

/** Published simulation ids for the sitemap. */
export async function listPublicSimulationIds(): Promise<{ id: string; createdAt: string }[]> {
  const admin = adminOrNull()
  if (!admin) return []
  const { data } = await admin
    .from('simulations')
    .select('id, created_at')
    .eq('is_published', true)
  return (data || []).map((r) => ({ id: r.id, createdAt: r.created_at }))
}

export { normalizeCertificateId }

export interface VerifiedCertificate {
  attemptId: string
  studentName: string
  simulationId: string
  /** Unpublished simulations have no public catalog page to link to. */
  simulationPublished: boolean
  simulationTitle: string
  roleType: string
  companyName: string | null
  score: number
  completedAt: string
}

/**
 * Resolves a certificate ID (first 12 hex digits of the attempt UUID) to its completed attempt.
 * Only the fields printed on the certificate itself are returned.
 */
export async function lookupCertificate(certId: string, locale: Locale): Promise<VerifiedCertificate | null> {
  const range = certificateIdToUuidRange(certId)
  if (!range) return null
  const admin = adminOrNull()
  if (!admin) return null

  const { data, error } = await admin
    .from('simulation_attempts')
    .select(
      `id, score, completed_at, simulation_id,
       student:users!student_id(full_name),
       simulation:simulations(is_published, ${SIM_FIELDS})`
    )
    .eq('status', 'completed')
    .gte('id', range.min)
    .lte('id', range.max)
    .order('completed_at', { ascending: true })
    .limit(1)

  if (error || !data?.[0]) return null
  const row = data[0] as unknown as {
    id: string
    score: number | null
    completed_at: string | null
    simulation_id: string
    student: { full_name: string } | null
    simulation: (SimRow & { is_published: boolean }) | null
  }
  if (!row.simulation || !row.student) return null

  const loc = localizeSimulation(row.simulation, locale)
  return {
    attemptId: row.id,
    studentName: row.student.full_name,
    simulationId: row.simulation_id,
    simulationPublished: row.simulation.is_published,
    simulationTitle: loc.title,
    roleType: loc.role_type,
    companyName: row.simulation.creator?.company_name || null,
    score: row.score ?? 0,
    completedAt: row.completed_at || new Date().toISOString(),
  }
}
