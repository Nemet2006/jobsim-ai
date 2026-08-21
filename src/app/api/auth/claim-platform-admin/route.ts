import { NextResponse } from 'next/server'
import { jsonError, requireAuth } from '@/lib/api-auth'
import { ensurePlatformAdmin } from '@/lib/ensure-platform-admin'
import { isPlatformAdminEmail } from '@/lib/platform-admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { user } = await requireAuth()
    if (!isPlatformAdminEmail(user.email)) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    await ensurePlatformAdmin(user.id, user.email)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonError(error)
  }
}
