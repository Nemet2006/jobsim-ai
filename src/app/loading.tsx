export default function RootLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 rounded-full border-2 border-navy/20 border-t-navy animate-spin" />
      <span className="sr-only">Yüklənir…</span>
    </div>
  )
}
