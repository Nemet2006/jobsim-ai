import { NextResponse } from 'next/server'
import { jsonError, requireRole } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/premium'

export const dynamic = 'force-dynamic'

const RANGES: Record<string, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

function sinceForRange(range: string): string {
  const days = RANGES[range]
  if (days === null) return new Date('2020-01-01T00:00:00Z').toISOString()
  const d = new Date()
  d.setDate(d.getDate() - (days ?? 30))
  return d.toISOString()
}

export async function GET(request: Request) {
  try {
    await requireRole('admin')

    const url = new URL(request.url)
    const range = RANGES[url.searchParams.get('range') ?? ''] !== undefined
      ? (url.searchParams.get('range') as string)
      : '30d'
    const since = sinceForRange(range)

    const admin = createAdminClient()

    const head = { count: 'exact' as const, head: true }
    const [
      totalUsersRes,
      studentsRes,
      hrUsersRes,
      coursesUsersRes,
      premiumUsersRes,
      newRegistrationsRes,
      attemptsStartedRes,
      attemptsCompletedRes,
      groupCountRes,
      groupMembersRes,
    ] = await Promise.all([
      admin.from('users').select('*', head),
      admin.from('users').select('*', head).eq('role', 'student'),
      admin.from('users').select('*', head).eq('role', 'hr'),
      admin.from('users').select('*', head).eq('role', 'courses'),
      admin.from('users').select('*', head).eq('is_premium', true),
      admin.from('users').select('*', head).gte('created_at', since),
      admin.from('simulation_attempts').select('*', head).gte('started_at', since),
      admin
        .from('simulation_attempts')
        .select('*', head)
        .eq('status', 'completed')
        .gte('completed_at', since),
      admin.from('course_groups').select('*', head),
      admin.from('group_members').select('*', head),
    ])

    const totalUsers = totalUsersRes.count ?? 0
    const students = studentsRes.count ?? 0
    const hrUsers = hrUsersRes.count ?? 0
    const coursesUsers = coursesUsersRes.count ?? 0
    const premiumUsers = premiumUsersRes.count ?? 0
    const newRegistrations = newRegistrationsRes.count ?? 0
    const attemptsStarted = attemptsStartedRes.count ?? 0
    const attemptsCompleted = attemptsCompletedRes.count ?? 0
    const groupCount = groupCountRes.count ?? 0
    const groupMembers = groupMembersRes.count ?? 0

    const [regRowsRes, scoreRowsRes, premiumRowsRes, eventsSummaryRes] = await Promise.all([
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
        .from('premium_subscriptions')
        .select('amount_cents, provider, created_at')
        .gte('created_at', since)
        .limit(10000),
      admin.rpc('analytics_summary', { p_since: since }),
    ])

    // Daily registration series (from business tables — includes
    // history from before event tracking was deployed).
    const registrationsDaily: Record<string, number> = {}
    const registrationsByRole: Record<string, number> = {}
    for (const row of regRowsRes.data ?? []) {
      const day = String(row.created_at).slice(0, 10)
      registrationsDaily[day] = (registrationsDaily[day] ?? 0) + 1
      registrationsByRole[row.role] = (registrationsByRole[row.role] ?? 0) + 1
    }

    const scores = (scoreRowsRes.data ?? [])
      .map((r) => r.score)
      .filter((s): s is number => typeof s === 'number')
    const avgScore = scores.length
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : null

    const premiumRows = premiumRowsRes.data ?? []
    const revenueCents = premiumRows.reduce((s, r) => s + (r.amount_cents ?? 0), 0)

    // Event-based metrics require SQL_ANALYTICS.sql to be applied.
    const eventMetrics = eventsSummaryRes.error ? null : eventsSummaryRes.data

    return NextResponse.json({
      range,
      since,
      generatedAt: new Date().toISOString(),
      totals: {
        totalUsers,
        students,
        hrUsers,
        coursesUsers,
        premiumUsers,
        newRegistrations,
        attemptsStarted,
        attemptsCompleted,
        completionRate: attemptsStarted
          ? Math.round((attemptsCompleted / attemptsStarted) * 100)
          : 0,
        avgScore,
        premiumActivations: premiumRows.length,
        revenueCents,
        groupCount,
        groupMembers,
      },
      registrationsByRole,
      registrationsDaily: Object.entries(registrationsDaily).map(([day, count]) => ({
        day,
        count,
      })),
      events: eventMetrics,
    })
  } catch (error) {
    return jsonError(error, 'Analitika yüklənmədi')
  }
}
