'use client'

import Link from 'next/link'
import {
  IMPACT_GROWTH,
  IMPACT_KPIS,
  IMPACT_RECENT_USERS,
} from '@/lib/admin-impact-data'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-mute mb-1">
            Users
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">İstifadəçi paneli</h1>
        </div>
        <Link href="/admin/dashboard#users" className="text-sm font-semibold text-navy">
          Impact report →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: IMPACT_KPIS.totalUsers },
          { label: 'Active', value: IMPACT_KPIS.activeUsers },
          { label: 'New 30g', value: IMPACT_KPIS.newUsers30d },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-navy/8 p-5">
            <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
              {s.label}
            </p>
            <p className="number-display text-3xl text-ink mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 p-5">
        <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-3">
          Growth
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={IMPACT_GROWTH}>
            <XAxis dataKey="label" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8A8A8A', fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-mute border-b border-navy/8">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {IMPACT_RECENT_USERS.map((u) => (
              <tr key={u.email} className="border-b border-navy/6 last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-mid">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-ink-mute">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
