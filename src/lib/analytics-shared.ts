/**
 * Client-safe analytics contract: typed event names + payload sanitization.
 * Privacy rule: only whitelisted, non-PII property keys are ever accepted.
 */

export const CLIENT_EVENTS = [
  'page_view',
  'nav_click',
  'logout',
  'login_attempt',
  'login_success',
  'login_failed',
  'register_role_selected',
  'register_attempt',
  'register_failed',
  'simulation_exam_started',
  'simulation_submitted',
  'simulation_cheat_detected',
  'simulation_exam_failed',
  'premium_checkout_started',
  'premium_checkout_cancelled',
  'premium_promo_submitted',
  'hr_simulation_created',
  'hr_report_downloaded',
  'certificate_shared',
  'certificate_lookup',
  'public_sim_cta_click',
] as const

export const SERVER_EVENTS = [
  'user_registered',
  'simulation_started',
  'simulation_completed',
  'premium_activated',
  'group_joined',
  'admin_report_downloaded',
] as const

export type ClientEventName = (typeof CLIENT_EVENTS)[number]
export type ServerEventName = (typeof SERVER_EVENTS)[number]
export type AnalyticsEventName = ClientEventName | ServerEventName

const CLIENT_EVENT_SET: ReadonlySet<string> = new Set(CLIENT_EVENTS)

/** Whitelisted property keys. Anything else (emails, names, answers…) is dropped. */
const ALLOWED_PROPERTY_KEYS: ReadonlySet<string> = new Set([
  'role',
  'section',
  'href',
  'label',
  'variant',
  'source',
  'provider',
  'plan',
  'simulation_id',
  'attempt_id',
  'group_id',
  'score',
  'question_count',
  'cheat_count',
  'duration_minutes',
  'status',
  'error_code',
  'navigation_type',
  'method',
  'channel',
])

export type AnalyticsProperties = Record<string, string | number | boolean>

export function isClientEvent(name: unknown): name is ClientEventName {
  return typeof name === 'string' && CLIENT_EVENT_SET.has(name)
}

/** Keeps only whitelisted keys with primitive values; truncates long strings. */
export function sanitizeProperties(input: unknown): AnalyticsProperties {
  const out: AnalyticsProperties = {}
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_PROPERTY_KEYS.has(key)) continue
    if (typeof value === 'string') {
      out[key] = value.slice(0, 200)
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value
    } else if (typeof value === 'boolean') {
      out[key] = value
    }
  }
  return out
}

/** Strips query string / hash (may contain tokens) and caps length. */
export function sanitizePath(input: unknown): string | null {
  if (typeof input !== 'string' || input.length === 0) return null
  const withoutQuery = input.split(/[?#]/)[0].slice(0, 300)
  if (!withoutQuery.startsWith('/')) return null
  return withoutQuery
}

/** Referrer: origin + path only (no query), capped. */
export function sanitizeReferrer(input: unknown): string | null {
  if (typeof input !== 'string' || input.length === 0) return null
  try {
    const url = new URL(input)
    return `${url.origin}${url.pathname}`.slice(0, 300)
  } catch {
    return null
  }
}

const SESSION_ID_RE = /^[a-zA-Z0-9-]{8,64}$/

export function isValidSessionId(input: unknown): input is string {
  return typeof input === 'string' && SESSION_ID_RE.test(input)
}

const EVENT_ID_RE = /^[a-zA-Z0-9:_-]{8,120}$/

export function isValidEventId(input: unknown): input is string {
  return typeof input === 'string' && EVENT_ID_RE.test(input)
}
