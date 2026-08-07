const RANGE_LABEL: Record<string, string> = {
  '7d': '7 gün',
  '30d': '30 gün',
  '90d': '90 gün',
  all: 'Bütün dövr',
}

interface Metrics {
  totalUsers: number
  signUps: number
  signIns: number
  uniqueSimulators: number
  simulationsStarted: number
  simulationsCompleted: number
  tasksShared: number
  totalClicks: number
  pageViews: number
  avgScore: number | null
}

interface ReportProofViewProps {
  valid: boolean
  reportId: string | null
  range: string | null
  generatedAt: string | null
  metrics: Metrics | null
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-mute">{label}</p>
      <p className="mt-1 number-display text-2xl text-ink">{value}</p>
    </div>
  )
}

export function ReportProofView({
  valid,
  reportId,
  range,
  generatedAt,
  metrics,
}: ReportProofViewProps) {
  return (
    <div className="min-h-screen bg-paper text-ink px-5 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-md bg-navy flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" fill="#F6F3EC" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">JobSim AI</span>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div
            className={`relative w-28 h-28 rounded-full border-[3px] flex items-center justify-center mb-4 ${
              valid
                ? 'border-verdigris bg-verdigris-wash'
                : 'border-danger/50 bg-danger-tint'
            }`}
            aria-hidden="true"
          >
            {valid ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#1E7A63"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7l10 10M17 7L7 17"
                  stroke="#C4432E"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span
              className={`absolute -bottom-2 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-[0.16em] uppercase ${
                valid ? 'bg-verdigris text-paper' : 'bg-danger text-paper'
              }`}
            >
              {valid ? 'Verified' : 'Invalid'}
            </span>
          </div>

          {reportId ? (
            <p className="font-mono text-xs text-ink-mute tracking-wide">{reportId}</p>
          ) : null}
          {range ? (
            <p className="mt-1 text-sm text-ink-mid">{RANGE_LABEL[range] || range}</p>
          ) : null}
          {generatedAt ? (
            <p className="mt-0.5 text-xs text-ink-mute font-mono">
              {new Date(generatedAt).toLocaleString('az-AZ', {
                timeZone: 'Asia/Baku',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </p>
          ) : null}
        </div>

        {valid && metrics ? (
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Ümumi user" value={metrics.totalUsers} />
            <Metric label="Sign up" value={metrics.signUps} />
            <Metric label="Sign in" value={metrics.signIns} />
            <Metric label="Sim. edənlər" value={metrics.uniqueSimulators} />
            <Metric label="Sim. başladı" value={metrics.simulationsStarted} />
            <Metric label="Tamamlanan" value={metrics.simulationsCompleted} />
            <Metric label="Tapşırıq" value={metrics.tasksShared} />
            <Metric label="Klik" value={metrics.totalClicks} />
            <Metric label="Səhifə baxışı" value={metrics.pageViews} />
            <Metric label="Orta bal" value={metrics.avgScore ?? '—'} />
          </div>
        ) : (
          <div className="card-dossier p-8 text-center text-sm text-ink-mute">—</div>
        )}
      </div>
    </div>
  )
}
