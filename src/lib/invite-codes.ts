/** Invite codes for privileged signup. Env vars override/add to these defaults. */

export const DEFAULT_HR_INVITE_CODE = 'JOBSIM-HR-2026'
export const DEFAULT_COURSES_INVITE_CODE = 'JOBSIM-UNI-2026'

export function isValidHrInvite(code?: string): boolean {
  const entered = code?.trim()
  if (!entered) return false
  const fromEnv = process.env.HR_INVITE_CODE?.trim()
  return entered === DEFAULT_HR_INVITE_CODE || Boolean(fromEnv && entered === fromEnv)
}

export function isValidCoursesInvite(code?: string): boolean {
  const entered = code?.trim()
  if (!entered) return false
  const fromEnv = process.env.COURSES_INVITE_CODE?.trim()
  return entered === DEFAULT_COURSES_INVITE_CODE || Boolean(fromEnv && entered === fromEnv)
}
