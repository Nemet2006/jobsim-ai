import type { UserRole } from '@/types'

const FROM_ENV = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

/** Owner accounts that always map to the admin portal. */
export const PLATFORM_ADMIN_EMAILS = new Set<string>([
  'admin44@jobsim.ai',
  ...FROM_ENV,
])

export function isPlatformAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return PLATFORM_ADMIN_EMAILS.has(email.trim().toLowerCase())
}

export function resolveUserRole(
  role?: string | null,
  email?: string | null,
): UserRole | null {
  if (isPlatformAdminEmail(email)) return 'admin'
  if (role === 'student' || role === 'hr' || role === 'courses' || role === 'admin') {
    return role
  }
  return null
}
