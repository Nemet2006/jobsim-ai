import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
  }
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError('Daxil olmalısınız', 401)
  }

  return { supabase, user }
}

export async function requireRole(allowed: UserRole | UserRole[]) {
  const { supabase, user } = await requireAuth()
  const roles = Array.isArray(allowed) ? allowed : [allowed]

  const { data: profile } = await supabase
    .from('users')
    .select('role, is_premium, company_name, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.role || !roles.includes(profile.role as UserRole)) {
    throw new ApiError('Bu əməliyyat üçün icazəniz yoxdur', 403)
  }

  return { supabase, user, profile }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

export function jsonError(error: unknown, fallback = 'Xəta baş verdi') {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return Response.json({ error: fallback }, { status: 500 })
}

export function sanitizeFilename(input: string, fallback = 'export'): string {
  const safe = input.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  return safe || fallback
}
