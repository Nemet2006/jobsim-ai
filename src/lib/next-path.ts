import type { UserRole } from '@/types'

/**
 * Validates a post-login `?next=` target. Only same-origin paths inside the
 * user's own portal are honored, so the parameter cannot be used as an open redirect.
 */
export function resolveNextPath(raw: string | null | undefined, role: UserRole): string | null {
  if (!raw) return null
  if (!raw.startsWith(`/${role}/`)) return null
  if (raw.startsWith('//') || raw.includes('\\') || /[\r\n]/.test(raw)) return null
  return raw
}

/** Reads `?next=` from the current URL (client only). */
export function readNextParam(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('next')
}
