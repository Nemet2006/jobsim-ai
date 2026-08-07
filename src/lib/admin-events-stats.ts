import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { ADMIN_USE_DEMO_STATS } from '@/lib/analytics-flags'
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/lib/analytics-shared'

export const KNOWN_EVENT_NAMES = [...CLIENT_EVENTS, ...SERVER_EVENTS].sort()

export interface EventsSummary {
  days: number
  since: string
  generatedAt: string
  eventFilter: string | null
  totalEvents: number
  uniqueSessions: number
  uniqueUsers: number
  byEvent: { event_name: string; total: number }[]
  byRole: { role: string; total: number }[]
}

export interface DemoEventRow {
  id: string
  event_name: string
  occurred_at: string
  user_id: string | null
  session_id: string | null
  role: string | null
  page_path: string | null
  referrer: string | null
  properties: Record<string, unknown>
}

function daysFactor(days: number): number {
  if (days <= 7) return 0.32
  if (days <= 30) return 1
  if (days <= 90) return 2.55
  return 3.9
}

function scale(n: number, factor: number): number {
  return Math.max(0, Math.round(n * factor))
}

/** Demo event totals aligned with the curated 30-day platform activity. */
function demoByEvent(factor: number): { event_name: string; total: number }[] {
  const rows: [string, number][] = [
    ['page_view', 13240],
    ['nav_click', 4280],
    ['login_attempt', 980],
    ['login_success', 898],
    ['login_failed', 86],
    ['user_registered', 312],
    ['register_attempt', 340],
    ['register_role_selected', 410],
    ['register_failed', 28],
    ['simulation_started', 486],
    ['simulation_exam_started', 470],
    ['simulation_submitted', 360],
    ['simulation_completed', 342],
    ['simulation_cheat_detected', 24],
    ['simulation_exam_failed', 18],
    ['hr_simulation_created', 52],
    ['hr_report_downloaded', 38],
    ['group_joined', 96],
    ['logout', 520],
    ['admin_report_downloaded', 14],
  ]
  return rows
    .map(([event_name, total]) => ({ event_name, total: scale(total, factor) }))
    .sort((a, b) => b.total - a.total)
}

function demoByRole(factor: number): { role: string; total: number }[] {
  return [
    { role: 'student', total: scale(14200, factor) },
    { role: 'hr', total: scale(2100, factor) },
    { role: 'courses', total: scale(980, factor) },
    { role: 'anonim', total: scale(6200, factor) },
    { role: 'admin', total: scale(120, factor) },
  ].sort((a, b) => b.total - a.total)
}

export function buildDemoEventsSummary(days: number, eventFilter: string | null): EventsSummary {
  const factor = daysFactor(days)
  let byEvent = demoByEvent(factor)
  if (eventFilter) {
    byEvent = byEvent.filter((r) => r.event_name === eventFilter)
  }
  const byRole = eventFilter ? demoByRole(factor * 0.35) : demoByRole(factor)
  const totalEvents = byEvent.reduce((s, r) => s + r.total, 0)
  const since = new Date()
  since.setDate(since.getDate() - days)

  return {
    days,
    since: since.toISOString(),
    generatedAt: new Date().toISOString(),
    eventFilter,
    totalEvents,
    uniqueSessions: scale(1860, factor),
    uniqueUsers: scale(640, factor),
    byEvent,
    byRole,
  }
}

export function buildDemoEventRows(
  days: number,
  page: number,
  pageSize: number,
  eventFilter: string | null
): { items: DemoEventRow[]; total: number } {
  const summary = buildDemoEventsSummary(days, eventFilter)
  const total = summary.totalEvents
  const start = page * pageSize
  if (start >= total) return { items: [], total }

  const eventPool = summary.byEvent.length
    ? summary.byEvent
    : [{ event_name: 'page_view', total: 1 }]
  const roles = ['student', 'hr', 'courses', null, 'student', 'student']
  const paths = [
    '/',
    '/login',
    '/register',
    '/student/dashboard',
    '/student/simulations',
    '/hr/dashboard',
    '/courses/dashboard',
    '/admin/dashboard',
  ]

  const items: DemoEventRow[] = []
  const count = Math.min(pageSize, total - start)
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const idx = start + i
    const event = eventPool[idx % eventPool.length]!
    const role = roles[idx % roles.length] ?? null
    const occurred = new Date(now - (idx * 47_000 + (idx % 9) * 3_600_000))
    const idSeed = createHash('sha256').update(`demo-event:${days}:${idx}:${event.event_name}`).digest('hex')

    items.push({
      id: `${idSeed.slice(0, 8)}-${idSeed.slice(8, 12)}-${idSeed.slice(12, 16)}-${idSeed.slice(16, 20)}-${idSeed.slice(20, 32)}`,
      event_name: event.event_name,
      occurred_at: occurred.toISOString(),
      user_id: role ? `u${idSeed.slice(0, 8)}-${idSeed.slice(8, 12)}-4${idSeed.slice(13, 16)}-a${idSeed.slice(17, 20)}-${idSeed.slice(20, 32)}` : null,
      session_id: `s${idSeed.slice(0, 12)}`,
      role,
      page_path: paths[idx % paths.length] ?? '/',
      referrer: idx % 5 === 0 ? 'https://www.google.com/' : null,
      properties:
        event.event_name.includes('simulation')
          ? { simulation_id: `sim-${idSeed.slice(0, 6)}`, score: 60 + (idx % 40) }
          : event.event_name.includes('login') || event.event_name.includes('register')
            ? { role: role || 'student' }
            : {},
    })
  }

  return { items, total }
}

type AdminClient = SupabaseClient<Database>

export async function buildLiveEventsSummary(
  admin: AdminClient,
  days: number,
  eventFilter: string | null
): Promise<EventsSummary> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceIso = since.toISOString()

  let query = admin
    .from('analytics_events')
    .select('event_name, role, session_id, user_id')
    .gte('occurred_at', sinceIso)
    .limit(20000)

  if (eventFilter) query = query.eq('event_name', eventFilter)

  const { data, error } = await query
  if (error) throw error

  const rows = data ?? []
  const byEventMap = new Map<string, number>()
  const byRoleMap = new Map<string, number>()
  const sessions = new Set<string>()
  const users = new Set<string>()

  for (const row of rows) {
    byEventMap.set(row.event_name, (byEventMap.get(row.event_name) || 0) + 1)
    const roleKey = row.role || 'anonim'
    byRoleMap.set(roleKey, (byRoleMap.get(roleKey) || 0) + 1)
    if (row.session_id) sessions.add(row.session_id)
    if (row.user_id) users.add(row.user_id)
  }

  return {
    days,
    since: sinceIso,
    generatedAt: new Date().toISOString(),
    eventFilter,
    totalEvents: rows.length,
    uniqueSessions: sessions.size,
    uniqueUsers: users.size,
    byEvent: [...byEventMap.entries()]
      .map(([event_name, total]) => ({ event_name, total }))
      .sort((a, b) => b.total - a.total),
    byRole: [...byRoleMap.entries()]
      .map(([role, total]) => ({ role, total }))
      .sort((a, b) => b.total - a.total),
  }
}

export async function buildEventsSummary(
  admin: AdminClient,
  days: number,
  eventFilter: string | null
): Promise<EventsSummary> {
  if (ADMIN_USE_DEMO_STATS) return buildDemoEventsSummary(days, eventFilter)
  return buildLiveEventsSummary(admin, days, eventFilter)
}
