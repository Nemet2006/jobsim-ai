import { jsonError, requireRole, sanitizeFilename } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/premium'
import { buildAdminAnalyticsSnapshot } from '@/lib/admin-analytics'
import { generateAdminReportPdf } from '@/lib/admin-report-pdf'
import { trackServerEvent } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { user } = await requireRole('admin')
    const rateLimited = await enforceRateLimit(`admin-report:${user.id}`, 30, 3600)
    if (rateLimited) return rateLimited

    const url = new URL(request.url)
    const range = url.searchParams.get('range')

    // Always rebuild from live DB — never trust client-sent stats.
    const snapshot = await buildAdminAnalyticsSnapshot(createAdminClient(), range)
    const { pdf, reportId } = await generateAdminReportPdf(snapshot)

    const stamp = new Date(snapshot.generatedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = sanitizeFilename(
      `jobsim-admin-hesabat-${snapshot.range}-${stamp}`,
      'jobsim-admin-hesabat'
    )

    await trackServerEvent({
      eventName: 'admin_report_downloaded',
      userId: user.id,
      role: 'admin',
      properties: {
        method: 'pdf',
        label: snapshot.range,
      },
    })

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Cache-Control': 'no-store',
        'X-Report-Generated-At': snapshot.generatedAt,
        'X-Report-Range': snapshot.range,
        'X-Report-Id': reportId,
      },
    })
  } catch (error) {
    return jsonError(error, 'Hesabat yaradılmadı')
  }
}
