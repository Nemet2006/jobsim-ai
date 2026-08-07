import { jsonError, requireRole, sanitizeFilename } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/premium'
import { buildEventsSummary, KNOWN_EVENT_NAMES } from '@/lib/admin-events-stats'
import { generateEventsReportPdf } from '@/lib/admin-events-report-pdf'
import { trackServerEvent } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { user } = await requireRole('admin')
    const rateLimited = await enforceRateLimit(`admin-events-report:${user.id}`, 30, 3600)
    if (rateLimited) return rateLimited

    const url = new URL(request.url)
    const days = Math.min(
      365,
      Math.max(1, Number.parseInt(url.searchParams.get('days') ?? '30', 10) || 30)
    )
    const rawEvent = url.searchParams.get('event') ?? ''
    const eventFilter =
      rawEvent && KNOWN_EVENT_NAMES.includes(rawEvent as (typeof KNOWN_EVENT_NAMES)[number])
        ? rawEvent
        : null

    const summary = await buildEventsSummary(createAdminClient(), days, eventFilter)
    const { pdf, reportId } = await generateEventsReportPdf(summary)

    const stamp = new Date(summary.generatedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = sanitizeFilename(
      `jobsim-hadiseler-hesabat-${days}d-${stamp}`,
      'jobsim-hadiseler-hesabat'
    )

    await trackServerEvent({
      eventName: 'admin_report_downloaded',
      userId: user.id,
      role: 'admin',
      properties: {
        method: 'pdf',
        label: `events:${days}d`,
      },
    })

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Cache-Control': 'no-store',
        'X-Report-Generated-At': summary.generatedAt,
        'X-Report-Id': reportId,
        'X-Report-Days': String(days),
      },
    })
  } catch (error) {
    return jsonError(error, 'Hadisələr hesabatı yaradılmadı')
  }
}
