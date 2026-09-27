/**
 * Invite codes for privileged signup (HR / Courses).
 * The public demo defaults only work while the matching env var is unset —
 * once HR_INVITE_CODE / COURSES_INVITE_CODE is configured, only that secret is accepted.
 */

export const DEFAULT_HR_INVITE_CODE = 'JOBSIM-HR-2026'
export const DEFAULT_COURSES_INVITE_CODE = 'JOBSIM-UNI-2026'

function matchesInvite(entered: string | undefined, configured: string | undefined, fallback: string): boolean {
  const code = entered?.trim()
  if (!code) return false
  const secret = configured?.trim()
  return code === (secret || fallback)
}

export function isValidHrInvite(code?: string): boolean {
  return matchesInvite(code, process.env.HR_INVITE_CODE, DEFAULT_HR_INVITE_CODE)
}

export function isValidCoursesInvite(code?: string): boolean {
  return matchesInvite(code, process.env.COURSES_INVITE_CODE, DEFAULT_COURSES_INVITE_CODE)
}
