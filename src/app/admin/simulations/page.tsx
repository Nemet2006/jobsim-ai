export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { IMPACT_KPIS, IMPACT_SIM_RECORDS } from '@/lib/admin-impact-data'

export default function AdminSimulationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-mute mb-1">
            Simulations
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">Simulyasiya qeydləri</h1>
        </div>
        <Link href="/admin/dashboard#simulations" className="text-sm font-semibold text-navy">
          Impact report →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Aktiv sim.', value: IMPACT_KPIS.simulations },
          { label: 'Tamamlanan', value: IMPACT_KPIS.simulationsCompleted },
          { label: 'Orta bal', value: IMPACT_KPIS.avgScore },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-navy/8 p-5">
            <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
              {s.label}
            </p>
            <p className="number-display text-3xl text-ink mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-mute border-b border-navy/8">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Namizəd</th>
              <th className="px-4 py-3">Interview Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {IMPACT_SIM_RECORDS.map((s, i) => (
              <tr key={`${s.email}-${s.date}`} className="border-b border-navy/6 last:border-0">
                <td className="px-4 py-3 text-ink-mute">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{s.candidate}</p>
                  <p className="font-mono text-[10px] text-ink-mute">{s.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-mid">{s.type}</td>
                <td className="px-4 py-3 text-ink-mid text-xs whitespace-nowrap">{s.date}</td>
                <td className="px-4 py-3 font-semibold text-verdigris">{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
