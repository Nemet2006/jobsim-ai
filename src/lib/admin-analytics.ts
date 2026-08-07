import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'

export const ADMIN_RANGES: Record<string, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

export type AdminRange = keyof typeof ADMIN_RANGES

export interface RoleBreakdown {
  student: number
  hr: number
  courses: number
  admin: number
  other: number
  total: number
}

export interface AdminCoreMetrics {
  signUps: RoleBreakdown
  signIns: RoleBreakdown
  loginAttempts: number
  loginFailed: number
  simulationsStarted: number
  simulationsCompleted: number
  uniqueSimulators: number
  completionRate: number
  avgScore: number | null
  tasksShared: {
    courseAssignments: number
    groupAssignments: number
    hrSimulationsCreated: number
    total: number
  }
  totalClicks: number
  pageViews: number
  uniqueVisitors: number
}

export interface AdminAnalyticsSnapshot {
  range: string
  since: string
  generatedAt: string
  core: AdminCoreMetrics
  registrationsDaily: { day: string; count: number }[]
  totals: {
    totalUsers: number
    students: number
    hrUsers: number
    coursesUsers: number
  }
  events: {
    page_views: number
    unique_visitors: number
    active_users: number
    interaction_events: number
    top_pages: { page_path: string; views: number; visitors: number }[]
    top_events: { event_name: string; total: number }[]
    daily: {
      day: string
      page_views: number
      visitors: number
      registrations: number
      completions: number
    }[]
    funnel: {
      visitors: number
      registered: number
      simulation_started: number
      simulation_completed: number
      premium_activated: number
    }
  } | null
}

type AdminClient = SupabaseClient<Database>

function emptyRoles(): RoleBreakdown {
  return { student: 0, hr: 0, courses: 0, admin: 0, other: 0, total: 0 }
}

function bumpRole(target: RoleBreakdown, role: string | null | undefined) {
  const key = (role || '').toLowerCase()
  if (key === 'student' || key === 'hr' || key === 'courses' || key === 'admin') {
    target[key] += 1
  } else {
    target.other += 1
  }
  target.total += 1
}

function resolveEventRole(row: {
  role: string | null
  properties: Json
}): string | null {
  if (row.role) return row.role
  if (row.properties && typeof row.properties === 'object' && !Array.isArray(row.properties)) {
    const role = (row.properties as Record<string, unknown>).role
    return typeof role === 'string' ? role : null
  }
  return null
}

async function headCount(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const { count, error } = await query
  if (error) {
    console.warn('Admin analytics count failed:', error.message)
    return 0
  }
  return count ?? 0
}

function asRecord(value: Json | null): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function sinceForRange(range: string): string {
  const days = ADMIN_RANGES[range]
  if (days === null) return new Date('2020-01-01T00:00:00Z').toISOString()
  const d = new Date()
  d.setDate(d.getDate() - (days ?? 30))
  return d.toISOString()
}

export function normalizeRange(input: string | null): AdminRange {
  if (input && input in ADMIN_RANGES) return input as AdminRange
  return '30d'
}

/**
 * Builds an admin analytics snapshot.
 * When ADMIN_USE_DEMO_STATS is on, returns curated presentation numbers
 * (live DB queries + event tracking stay off until flags are flipped).
 */
export async function buildAdminAnalyticsSnapshot(
  admin: AdminClient,
  rangeInput: string | null
): Promise<AdminAnalyticsSnapshot> {
  const range = normalizeRange(rangeInput)

  const { ADMIN_USE_DEMO_STATS } = await import('@/lib/analytics-flags')
  if (ADMIN_USE_DEMO_STATS) {
    const { buildDemoAdminSnapshot } = await import('@/lib/admin-demo-stats')
    return buildDemoAdminSnapshot(range)
  }

  const since = sinceForRange(range)
  const head = { count: 'exact' as const, head: true }

  const [
    totalUsers,
    students,
    hrUsers,
    coursesUsers,
    newRegsStudent,
    newRegsHr,
    newRegsCourses,
    newRegsAdmin,
    attemptsStarted,
    attemptsCompleted,
    courseAssignments,
    groupAssignments,
    hrSimsCreated,
    loginAttempts,
    loginFailed,
    navClicks,
    pageViewsFallback,
  ] = await Promise.all([
    headCount(admin.from('users').select('*', head)),
    headCount(admin.from('users').select('*', head).eq('role', 'student')),
    headCount(admin.from('users').select('*', head).eq('role', 'hr')),
    headCount(admin.from('users').select('*', head).eq('role', 'courses')),
    headCount(admin.from('users').select('*', head).eq('role', 'student').gte('created_at', since)),
    headCount(admin.from('users').select('*', head).eq('role', 'hr').gte('created_at', since)),
    headCount(admin.from('users').select('*', head).eq('role', 'courses').gte('created_at', since)),
    headCount(admin.from('users').select('*', head).eq('role', 'admin').gte('created_at', since)),
    headCount(admin.from('simulation_attempts').select('*', head).gte('started_at', since)),
    headCount(
      admin
        .from('simulation_attempts')
        .select('*', head)
        .eq('status', 'completed')
        .gte('completed_at', since)
    ),
    headCount(admin.from('course_assignments').select('*', head).gte('assigned_at', since)),
    headCount(admin.from('group_sim_assignments').select('*', head).gte('assigned_at', since)),
    headCount(admin.from('simulations').select('*', head).gte('created_at', since)),
    headCount(
      admin.from('analytics_events').select('*', head).eq('event_name', 'login_attempt').gte('occurred_at', since)
    ),
    headCount(
      admin.from('analytics_events').select('*', head).eq('event_name', 'login_failed').gte('occurred_at', since)
    ),
    headCount(
      admin.from('analytics_events').select('*', head).eq('event_name', 'nav_click').gte('occurred_at', since)
    ),
    headCount(
      admin.from('analytics_events').select('*', head).eq('event_name', 'page_view').gte('occurred_at', since)
    ),
  ])

  const [
    regRowsRes,
    scoreRowsRes,
    attemptStudentsRes,
    loginSuccessRes,
    eventsSummaryRes,
  ] = await Promise.all([
    admin
      .from('users')
      .select('created_at, role')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(10000),
    admin
      .from('simulation_attempts')
      .select('score')
      .eq('status', 'completed')
      .gte('completed_at', since)
      .not('score', 'is', null)
      .limit(10000),
    admin
      .from('simulation_attempts')
      .select('student_id')
      .gte('started_at', since)
      .limit(20000),
    admin
      .from('analytics_events')
      .select('role, properties')
      .eq('event_name', 'login_success')
      .gte('occurred_at', since)
      .limit(20000),
    admin.rpc('analytics_summary', { p_since: since }),
  ])

  const signUps = emptyRoles()
  signUps.student = newRegsStudent
  signUps.hr = newRegsHr
  signUps.courses = newRegsCourses
  signUps.admin = newRegsAdmin
  signUps.total = newRegsStudent + newRegsHr + newRegsCourses + newRegsAdmin

  const signIns = emptyRoles()
  for (const row of loginSuccessRes.data ?? []) {
    bumpRole(signIns, resolveEventRole(row))
  }

  const uniqueSimulators = new Set(
    (attemptStudentsRes.data ?? []).map((r) => r.student_id).filter(Boolean)
  ).size

  const scores = (scoreRowsRes.data ?? [])
    .map((r) => r.score)
    .filter((s): s is number => typeof s === 'number')
  const avgScore = scores.length
    ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    : null

  const registrationsDaily: Record<string, number> = {}
  for (const row of regRowsRes.data ?? []) {
    const day = String(row.created_at).slice(0, 10)
    registrationsDaily[day] = (registrationsDaily[day] ?? 0) + 1
  }

  const rawEvents = eventsSummaryRes.error ? null : asRecord(eventsSummaryRes.data as Json)
  const funnelRaw = asRecord((rawEvents?.funnel as Json) ?? null)

  const pageViews = rawEvents ? asNumber(rawEvents.page_views, pageViewsFallback) : pageViewsFallback
  const uniqueVisitors = rawEvents ? asNumber(rawEvents.unique_visitors) : 0
  const interactionEvents = rawEvents ? asNumber(rawEvents.interaction_events) : 0
  const totalClicks = navClicks > 0 ? navClicks : interactionEvents

  const tasksTotal = courseAssignments + groupAssignments + hrSimsCreated

  return {
    range,
    since,
    generatedAt: new Date().toISOString(),
    core: {
      signUps,
      signIns,
      loginAttempts,
      loginFailed,
      simulationsStarted: attemptsStarted,
      simulationsCompleted: attemptsCompleted,
      uniqueSimulators,
      completionRate: attemptsStarted
        ? Math.round((attemptsCompleted / attemptsStarted) * 100)
        : 0,
      avgScore,
      tasksShared: {
        courseAssignments,
        groupAssignments,
        hrSimulationsCreated: hrSimsCreated,
        total: tasksTotal,
      },
      totalClicks,
      pageViews,
      uniqueVisitors,
    },
    registrationsDaily: Object.entries(registrationsDaily).map(([day, count]) => ({
      day,
      count,
    })),
    totals: {
      totalUsers,
      students,
      hrUsers,
      coursesUsers,
    },
    events: rawEvents
      ? {
          page_views: pageViews,
          unique_visitors: uniqueVisitors,
          active_users: asNumber(rawEvents.active_users),
          interaction_events: interactionEvents,
          top_pages: Array.isArray(rawEvents.top_pages)
            ? (rawEvents.top_pages as { page_path: string; views: number; visitors: number }[])
            : [],
          top_events: Array.isArray(rawEvents.top_events)
            ? (rawEvents.top_events as { event_name: string; total: number }[])
            : [],
          daily: Array.isArray(rawEvents.daily)
            ? (rawEvents.daily as {
                day: string
                page_views: number
                visitors: number
                registrations: number
                completions: number
              }[])
            : [],
          funnel: {
            visitors: asNumber(funnelRaw?.visitors),
            registered: asNumber(funnelRaw?.registered),
            simulation_started: asNumber(funnelRaw?.simulation_started),
            simulation_completed: asNumber(funnelRaw?.simulation_completed),
            premium_activated: asNumber(funnelRaw?.premium_activated),
          },
        }
      : null,
  }
}
