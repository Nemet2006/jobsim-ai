import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { trackServerEvent } from '@/lib/analytics'
import {
  isClientEvent,
  isValidEventId,
  isValidSessionId,
  sanitizeProperties,
} from '@/lib/analytics-shared'

const MAX_BODY_BYTES = 4096

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimited = await enforceRateLimit(`analytics:${ip}`, 120, 60)
    if (rateLimited) return rateLimited

    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload çox böyükdür' }, { status: 413 })
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Yanlış format' }, { status: 400 })
    }

    const eventName = body.event
    if (!isClientEvent(eventName)) {
      return NextResponse.json({ error: 'Naməlum event' }, { status: 400 })
    }

    // Optional auth enrichment — anonymous visitors are also tracked.
    let userId: string | null = null
    let role: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        role = profile?.role ?? null
      }
    } catch {
      // anonymous is fine
    }

    await trackServerEvent({
      eventName,
      userId,
      role,
      sessionId: isValidSessionId(body.sessionId) ? body.sessionId : null,
      pagePath: typeof body.path === 'string' ? body.path : null,
      referrer: typeof body.referrer === 'string' ? body.referrer : null,
      properties: sanitizeProperties(body.properties),
      eventId: isValidEventId(body.eventId) ? body.eventId : null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('Analytics track route failed:', err)
    // Analytics endpoint should not surface server errors to callers.
    return NextResponse.json({ ok: false })
  }
}
