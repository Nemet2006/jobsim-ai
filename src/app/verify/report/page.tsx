import { verifyReportProofToken } from '@/lib/admin-report-proof'
import { ReportProofView } from '@/components/admin/ReportProofView'

export const dynamic = 'force-dynamic'

export default async function VerifyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const token = typeof t === 'string' ? t : ''
  const result = token
    ? verifyReportProofToken(token)
    : ({ ok: false as const, error: 'missing_token' })

  if (!result.ok) {
    return (
      <ReportProofView
        valid={false}
        reportId={null}
        range={null}
        generatedAt={null}
        kind={null}
        metrics={null}
      />
    )
  }

  return (
    <ReportProofView
      valid
      reportId={result.payload.id}
      range={result.payload.range}
      generatedAt={result.payload.generatedAt}
      kind={result.payload.kind}
      metrics={result.payload.metrics}
    />
  )
}
