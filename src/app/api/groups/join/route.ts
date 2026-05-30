import { NextResponse } from 'next/server'
import { ApiError, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireRole('student')
    const rateLimited = await enforceRateLimit(`group-join:${user.id}`, 10, 3600)
    if (rateLimited) return rateLimited

    const body = await request.json().catch(() => ({}))
    const code = String(body.code || '').trim()

    if (code.length < 4) {
      throw new ApiError('Kod ən az 4 simvol olmalıdır', 400)
    }

    const { data, error } = await supabase.rpc('join_group_by_code', { p_code: code })

    if (error) {
      console.error('join_group_by_code error:', error.message)
      throw new ApiError('Qrupa qoşulma uğursuz oldu', 500)
    }

    const result = data as { ok: boolean; error?: string; group_name?: string }

    if (!result?.ok) {
      const messages: Record<string, string> = {
        not_found: 'Belə bir kod tapılmadı. Müəlliminizlə yoxlayın.',
        already_member: 'Siz artıq bu qrupun üzvüsünüz.',
        invalid_code: 'Yanlış kod formatı.',
        auth_required: 'Daxil olmalısınız',
      }
      throw new ApiError(messages[result.error || ''] || 'Qoşulma uğursuz', 400)
    }

    return NextResponse.json({
      ok: true,
      groupName: result.group_name,
    })
  } catch (error) {
    return jsonError(error, 'Qrupa qoşulma uğursuz oldu')
  }
}
