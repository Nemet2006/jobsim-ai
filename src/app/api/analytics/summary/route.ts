import { NextResponse } from 'next/server'
import { jsonError, requireRole } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/premium'
import { buildAdminAnalyticsSnapshot } from '@/lib/admin-analytics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireRole('admin')

    const url = new URL(request.url)
    const snapshot = await buildAdminAnalyticsSnapshot(
      createAdminClient(),
      url.searchParams.get('range')
    )

    return NextResponse.json(snapshot)
  } catch (error) {
    return jsonError(error, 'Analitika yüklənmədi')
  }
}
