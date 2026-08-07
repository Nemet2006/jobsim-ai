export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-live="polite">
      <div className="h-40 rounded-xl bg-navy/5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-navy/5" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-navy/5" />
      <span className="sr-only">Yüklənir…</span>
    </div>
  )
}
