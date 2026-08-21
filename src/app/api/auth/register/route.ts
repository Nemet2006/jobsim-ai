import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/premium'
import { ApiError, getClientIp, jsonError } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { trackServerEvent } from '@/lib/analytics'
import { isValidCoursesInvite, isValidHrInvite } from '@/lib/invite-codes'
import type { UserRole } from '@/types'
import { getT } from '@/i18n/get-locale'
import { isPlatformAdminEmail } from '@/lib/platform-admin'

function validateInvite(role: UserRole, inviteCode?: string): boolean {
  if (role === 'student') return true
  if (role === 'hr') return isValidHrInvite(inviteCode)
  if (role === 'courses') return isValidCoursesInvite(inviteCode)
  return false
}

export async function POST(request: Request) {
  try {
    const { t } = await getT()
    const ip = getClientIp(request)
    const rateLimited = await enforceRateLimit(`signup:${ip}`, 40, 900)
    if (rateLimited) return rateLimited

    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const fullName = String(body.fullName || '').trim().slice(0, 120)
    const role = (body.role || 'student') as UserRole
    const university = body.university ? String(body.university).slice(0, 120) : null
    const companyName = body.companyName ? String(body.companyName).slice(0, 120) : null
    const inviteCode = body.inviteCode ? String(body.inviteCode).trim() : undefined

    if (!email || !password || !fullName) {
      throw new ApiError(t('errors.requiredFields'), 400)
    }

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      throw new ApiError(t('errors.emailFormat'), 400)
    }

    if (password.length < 8 || password.length > 72) {
      throw new ApiError(t('errors.passwordRange'), 400)
    }

    if (!['student', 'hr', 'courses'].includes(role)) {
      throw new ApiError(t('errors.badRole'), 400)
    }

    if (!validateInvite(role, inviteCode)) {
      throw new ApiError(t('errors.inviteRequired'), 403)
    }

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        university: role === 'student' ? university : null,
        company_name: role === 'hr' ? companyName : null,
      },
    })

    if (error || !data.user) {
      throw new ApiError(error?.message || t('errors.registerFailed'), 400)
    }

    const assignedRole = isPlatformAdminEmail(email) ? 'admin' : role

    if (assignedRole !== 'student') {
      const { error: roleError } = await admin
        .from('users')
        .update({
          role: assignedRole,
          company_name: role === 'hr' ? companyName : null,
          university: role === 'courses' ? null : university,
        })
        .eq('id', data.user.id)

      if (roleError) {
        console.error('Role assignment failed:', roleError.message)
        throw new ApiError(t('errors.roleAssignFailed'), 500)
      }
    }

    await trackServerEvent({
      eventName: 'user_registered',
      userId: data.user.id,
      role: assignedRole,
      eventId: `user_registered:${data.user.id}`,
      properties: { role: assignedRole },
    })

    return NextResponse.json({
      ok: true,
      userId: data.user.id,
      role: assignedRole,
    })
  } catch (error) {
    return jsonError(error, 'Qeydiyyat uğursuz oldu')
  }
}
