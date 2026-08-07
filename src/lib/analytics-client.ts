'use client'

import type { AnalyticsProperties, ClientEventName } from '@/lib/analytics-shared'

const SESSION_STORAGE_KEY = 'jobsim_sid'

/** Anonymous, persistent visitor id — no PII, first-party only. */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    let sid = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sid || !/^[a-zA-Z0-9-]{8,64}$/.test(sid)) {
      sid = crypto.randomUUID()
      window.localStorage.setItem(SESSION_STORAGE_KEY, sid)
    }
    return sid
  } catch {
    return null
  }
}

/**
 * Fire-and-forget client event. Uses sendBeacon so events survive
 * navigations; falls back to keepalive fetch. Never throws.
 */
export function track(
  event: ClientEventName,
  properties?: AnalyticsProperties,
  pathOverride?: string
): void {
  if (typeof window === 'undefined') return
  try {
    const payload = JSON.stringify({
      event,
      properties: properties ?? {},
      path: pathOverride ?? window.location.pathname,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
      eventId: crypto.randomUUID(),
    })

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      if (navigator.sendBeacon('/api/analytics/track', blob)) return
    }

    void fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // analytics must never break the app
  }
}

let lastTrackedPath: string | null = null

/** Page view with consecutive-duplicate guard (prefetch/replay safety). */
export function trackPageView(path: string): void {
  const clean = path.split(/[?#]/)[0]
  if (!clean.startsWith('/') || clean === lastTrackedPath) return
  lastTrackedPath = clean
  track('page_view', undefined, clean)
}
