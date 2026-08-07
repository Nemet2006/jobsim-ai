import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  sanitizePath,
  sanitizeProperties,
  sanitizeReferrer,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from '@/lib/analytics-shared'

interface TrackEventParams {
  eventName: AnalyticsEventName
  userId?: string | null
  role?: string | null
  sessionId?: string | null
  pagePath?: string | null
  referrer?: string | null
  properties?: AnalyticsProperties
  /** Stable dedup key — repeated inserts with the same id are ignored. */
  eventId?: string | null
}

// Self-contained admin client (avoids import cycle with lib/premium).
function createAnalyticsAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin credentials not configured')
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Writes an analytics event with the service role (RLS default-deny table).
 * Never throws: analytics failures must not break product flows.
 */
export async function trackServerEvent(params: TrackEventParams): Promise<void> {
  try {
    const admin = createAnalyticsAdminClient()
    const { error } = await admin.from('analytics_events').upsert(
      {
        event_id: params.eventId ?? null,
        event_name: params.eventName,
        user_id: params.userId ?? null,
        session_id: params.sessionId ?? null,
        role: params.role ? String(params.role).slice(0, 16) : null,
        page_path: sanitizePath(params.pagePath) ?? null,
        referrer: sanitizeReferrer(params.referrer) ?? null,
        properties: sanitizeProperties(params.properties),
      },
      { onConflict: 'event_id', ignoreDuplicates: true }
    )
    if (error) {
      console.warn('Analytics insert failed:', error.message)
    }
  } catch (err) {
    console.warn('Analytics tracking failed:', err)
  }
}
