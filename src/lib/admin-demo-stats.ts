import type { AdminAnalyticsSnapshot, AdminRange, RoleBreakdown } from '@/lib/admin-analytics'
import { sinceForRange } from '@/lib/admin-analytics'

function roles(student: number, hr: number, courses: number, admin = 0): RoleBreakdown {
  return {
    student,
    hr,
    courses,
    admin,
    other: 0,
    total: student + hr + courses + admin,
  }
}

function scale(n: number, factor: number): number {
  return Math.max(0, Math.round(n * factor))
}

function scaleRoles(base: RoleBreakdown, factor: number): RoleBreakdown {
  const student = scale(base.student, factor)
  const hr = scale(base.hr, factor)
  const courses = scale(base.courses, factor)
  const admin = scale(base.admin, factor)
  return roles(student, hr, courses, admin)
}

/** Baseline looks like a busy last-30-days period (~300+ new users). */
const BASE_30D = {
  signUps: roles(248, 38, 26),
  signIns: roles(720, 112, 64, 2),
  loginAttempts: 980,
  loginFailed: 86,
  simulationsStarted: 486,
  simulationsCompleted: 342,
  uniqueSimulators: 214,
  avgScore: 76,
  courseAssignments: 188,
  groupAssignments: 96,
  hrSimulationsCreated: 52,
  totalClicks: 4280,
  pageViews: 13240,
  uniqueVisitors: 1860,
  activeUsers: 640,
  interactionEvents: 5120,
  // Platform-wide totals (lifetime-ish)
  totalUsers: 528,
  students: 412,
  hrUsers: 74,
  coursesUsers: 42,
}

const RANGE_FACTOR: Record<AdminRange, number> = {
  '7d': 0.32,
  '30d': 1,
  '90d': 2.55,
  all: 3.9,
}

function buildDailySeries(
  days: number,
  totalRegs: number,
  totalViews: number,
  totalCompletions: number
): NonNullable<AdminAnalyticsSnapshot['events']>['daily'] {
  const out: NonNullable<AdminAnalyticsSnapshot['events']>['daily'] = []
  const now = new Date()
  let remainingRegs = totalRegs
  let remainingViews = totalViews
  let remainingCompletions = totalCompletions

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const day = d.toISOString().slice(0, 10)
    const weight = 0.7 + ((i * 17) % 10) / 20 // mild variance
    const isLast = i === 0
    const regs = isLast
      ? remainingRegs
      : Math.min(remainingRegs, Math.max(1, Math.round((totalRegs / days) * weight)))
    const views = isLast
      ? remainingViews
      : Math.min(remainingViews, Math.max(8, Math.round((totalViews / days) * weight)))
    const completions = isLast
      ? remainingCompletions
      : Math.min(remainingCompletions, Math.max(0, Math.round((totalCompletions / days) * weight)))
    remainingRegs -= regs
    remainingViews -= views
    remainingCompletions -= completions
    out.push({
      day,
      page_views: views,
      visitors: Math.max(1, Math.round(views * 0.38)),
      registrations: regs,
      completions,
    })
  }
  return out
}

export function buildDemoAdminSnapshot(range: AdminRange): AdminAnalyticsSnapshot {
  const factor = RANGE_FACTOR[range]
  const signUps = scaleRoles(BASE_30D.signUps, factor)
  const signIns = scaleRoles(BASE_30D.signIns, factor)
  const loginAttempts = scale(BASE_30D.loginAttempts, factor)
  const loginFailed = scale(BASE_30D.loginFailed, factor)
  const simulationsStarted = scale(BASE_30D.simulationsStarted, factor)
  const simulationsCompleted = scale(BASE_30D.simulationsCompleted, factor)
  const uniqueSimulators = scale(BASE_30D.uniqueSimulators, factor)
  const courseAssignments = scale(BASE_30D.courseAssignments, factor)
  const groupAssignments = scale(BASE_30D.groupAssignments, factor)
  const hrSimulationsCreated = scale(BASE_30D.hrSimulationsCreated, factor)
  const totalClicks = scale(BASE_30D.totalClicks, factor)
  const pageViews = scale(BASE_30D.pageViews, factor)
  const uniqueVisitors = scale(BASE_30D.uniqueVisitors, factor)
  const activeUsers = scale(BASE_30D.activeUsers, factor)
  const interactionEvents = scale(BASE_30D.interactionEvents, factor)

  // Lifetime totals grow slightly with wider ranges so "all" looks bigger.
  const lifetimeFactor = range === 'all' ? 1.15 : range === '90d' ? 1.08 : 1
  const totalUsers = scale(BASE_30D.totalUsers, lifetimeFactor)
  const students = scale(BASE_30D.students, lifetimeFactor)
  const hrUsers = scale(BASE_30D.hrUsers, lifetimeFactor)
  const coursesUsers = scale(BASE_30D.coursesUsers, lifetimeFactor)

  const dayCount = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 120
  const daily = buildDailySeries(dayCount, signUps.total, pageViews, simulationsCompleted)
  const registrationsDaily = daily.map((d) => ({ day: d.day, count: d.registrations }))

  const completionRate = simulationsStarted
    ? Math.round((simulationsCompleted / simulationsStarted) * 100)
    : 0

  return {
    range,
    since: sinceForRange(range),
    generatedAt: new Date().toISOString(),
    core: {
      signUps,
      signIns,
      loginAttempts,
      loginFailed,
      simulationsStarted,
      simulationsCompleted,
      uniqueSimulators,
      completionRate,
      avgScore: BASE_30D.avgScore,
      tasksShared: {
        courseAssignments,
        groupAssignments,
        hrSimulationsCreated,
        total: courseAssignments + groupAssignments + hrSimulationsCreated,
      },
      totalClicks,
      pageViews,
      uniqueVisitors,
    },
    registrationsDaily,
    totals: {
      totalUsers,
      students,
      hrUsers,
      coursesUsers,
    },
    events: {
      page_views: pageViews,
      unique_visitors: uniqueVisitors,
      active_users: activeUsers,
      interaction_events: interactionEvents,
      top_pages: [
        { page_path: '/', views: Math.round(pageViews * 0.22), visitors: Math.round(uniqueVisitors * 0.35) },
        { page_path: '/student/simulations', views: Math.round(pageViews * 0.18), visitors: Math.round(uniqueVisitors * 0.28) },
        { page_path: '/login', views: Math.round(pageViews * 0.12), visitors: Math.round(uniqueVisitors * 0.3) },
        { page_path: '/register', views: Math.round(pageViews * 0.1), visitors: Math.round(uniqueVisitors * 0.22) },
        { page_path: '/student/dashboard', views: Math.round(pageViews * 0.09), visitors: Math.round(uniqueVisitors * 0.2) },
      ],
      top_events: [
        { event_name: 'login_success', total: signIns.total },
        { event_name: 'nav_click', total: totalClicks },
        { event_name: 'simulation_started', total: simulationsStarted },
        { event_name: 'simulation_completed', total: simulationsCompleted },
        { event_name: 'user_registered', total: signUps.total },
      ],
      daily,
      funnel: {
        visitors: uniqueVisitors,
        registered: signUps.total,
        simulation_started: uniqueSimulators,
        simulation_completed: Math.round(uniqueSimulators * 0.72),
        premium_activated: 0,
      },
    },
  }
}
