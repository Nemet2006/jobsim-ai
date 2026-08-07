/** Mini product UI frames for Evidence section — no external screenshots needed. */

export function MockLogin() {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 h-full">
      <p className="text-xs font-semibold text-ink mb-3">Welcome back!</p>
      <div className="space-y-2">
        <div className="h-8 rounded-md bg-paper-deep border border-navy/8" />
        <div className="h-8 rounded-md bg-paper-deep border border-navy/8" />
        <div className="h-8 rounded-md bg-navy" />
      </div>
    </div>
  )
}

export function MockDashboard() {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 h-full">
      <p className="text-xs font-semibold text-ink mb-3">Salam, Elvin!</p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {['12', '528', '76'].map((v) => (
          <div key={v} className="rounded-md bg-navy-wash px-2 py-2 text-center">
            <p className="text-sm font-bold text-navy">{v}</p>
          </div>
        ))}
      </div>
      <div className="h-2 rounded bg-paper-deep mb-1.5" />
      <div className="h-2 rounded bg-paper-deep w-2/3" />
    </div>
  )
}

export function MockSelect() {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 h-full">
      <p className="text-xs font-semibold text-ink mb-3">Simulyasiya seç</p>
      <div className="space-y-2">
        {['Software Engineer', 'Data Scientist', 'Product Manager'].map((t) => (
          <div
            key={t}
            className="rounded-md border border-navy/10 px-2.5 py-2 text-[11px] font-medium text-ink-mid"
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MockFeedback() {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 h-full">
      <p className="text-xs font-semibold text-ink mb-2">AI Feedback</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full border-[3px] border-verdigris flex items-center justify-center">
          <span className="text-sm font-bold text-verdigris">85</span>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 rounded bg-paper-deep" />
          <div className="h-1.5 rounded bg-paper-deep w-4/5" />
          <div className="h-1.5 rounded bg-paper-deep w-3/5" />
        </div>
      </div>
      <ul className="text-[10px] text-ink-mute space-y-1">
        <li>• Struktur güclüdür</li>
        <li>• Nümunələr əlavə et</li>
      </ul>
    </div>
  )
}
