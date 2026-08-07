'use client'

import dynamic from 'next/dynamic'

function ChartSkeleton({ label = 'Qrafik yüklənir…' }: { label?: string }) {
  return (
    <div className="card-dossier p-12 text-center text-ink-mute text-sm animate-pulse" role="status">
      {label}
    </div>
  )
}

export const LazyCompareClient = dynamic(() => import('@/components/hr/CompareClient'), {
  loading: () => <ChartSkeleton label="Müqayisə yüklənir…" />,
  ssr: false,
})

export const LazyReportsClient = dynamic(() => import('@/components/hr/ReportsClient'), {
  loading: () => <ChartSkeleton label="Hesabat yüklənir…" />,
  ssr: false,
})

export const LazySkillPassportClient = dynamic(
  () => import('@/components/simulation/SkillPassportClient'),
  {
    loading: () => <ChartSkeleton label="Bacarıq pasportu yüklənir…" />,
    ssr: false,
  }
)

export const LazyTractionDashboard = dynamic(
  () => import('@/components/admin/TractionDashboard'),
  {
    loading: () => <ChartSkeleton label="Analitika yüklənir…" />,
    ssr: false,
  }
)
