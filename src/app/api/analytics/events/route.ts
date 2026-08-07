import { NextResponse } from 'next/server'
import { jsonError, requireRole } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/premium'
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/lib/analytics-shared'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50
const KNOWN_EVENTS = new Set<string>([...CLIENT_EVENTS, ...SERVER_EVENTS])

export async function GET(request: Request) {
  try {
    await requireRole('admin')

    const url = new URL(request.url)
    const page = Math.max(0, Number.parseInt(url.searchParams.get('page') ?? '0', 10) || 0)
    const eventFilter = url.searchParams.get('event') ?? ''
    const days = Math.min(365, Math.max(1, Number.parseInt(url.searchParams.get('days') ?? '30', 10) || 30))

    const since = new Date()
    since.setDate(since.getDate() - days)

    const admin = createAdminClient()
    let query = admin
      .from('analytics_events')
      .select('id, event_name, occurred_at, user_id, session_id, role, page_path, referrer, properties', {
        count: 'exact',
      })
      .gte('occurred_at', since.toISOString())
      .order('occurred_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (eventFilter && KNOWN_EVENTS.has(eventFilter)) {
      query = query.eq('event_name', eventFilter)
    }

    const { data, count, error } = await query
    if (error) {
      return NextResponse.json(
        { error: 'Analytics cədvəli tapılmadı. SQL_ANALYTICS.sql migration-ını tətbiq edin.' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      eventNames: [...KNOWN_EVENTS].sort(),
    })
  } catch (error) {
    return jsonError(error, 'Eventlər yüklənmədi')
  }
}
