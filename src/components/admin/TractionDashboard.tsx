'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { RefreshCw, AlertTriangle, Radio } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { StatGrid, type StatItem } from '@/components/ui/StatGrid'

const CHART_COLORS = ['#1F4E4A', '#F47E47', '#3B82F6', '#F5C842', '#22A06B']
const CHART_TICK = '#8A8A8A'
const CHART_TOOLTIP = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(31, 78, 74, 0.12)',
  borderRadius: '12px',
  color: '#1A1A1A',
}

const RANGE_OPTIONS = [
  { value: '7d', label: '7 gün' },
  { value: '30d', label: '30 gün' },
  { value: '90d', label: '90 gün' },
  { value: 'all', label: 'Bütün dövr' },
]

const REFRESH_INTERVAL_MS = 30_000

interface DailyEventRow {
  day: string
  page_views: number
  visitors: number
  registrations: number
  completions: number
}

interface SummaryData {
  range: string
  since: string
  generatedAt: string
  totals: {
    totalUsers: number
    students: number
    hrUsers: number
    coursesUsers: number
    premiumUsers: number
    newRegistrations: number
    attemptsStarted: number
    attemptsCompleted: number
    completionRate: number
    avgScore: number | null
    premiumActivations: number
    revenueCents: number
    groupCount: number
    groupMembers: number
  }
  registrationsByRole: Record<string, number>
  registrationsDaily: { day: string; count: number }[]
  events: {
    page_views: number
    unique_visitors: number
    active_users: number
    interaction_events: number
    top_pages: { page_path: string; views: number; visitors: number }[]
    top_events: { event_name: string; total: number }[]
    daily: DailyEventRow[]
    funnel: {
      visitors: number
      registered: number
      simulation_started: number
      simulation_completed: number
      premium_activated: number
    }
  } | null
}

export default function TractionDashboard() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async (selectedRange: string, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`/api/analytics/summary?range=${selectedRange}`, {
        cache: 'no-store',
      })
      const payload = await res.json()
      if (!res.ok) {
        setError(payload.error || 'Analitika yüklənmədi')
        return
      }
      setData(payload)
      setError(null)
      setLastUpdated(new Date())
    } catch {
      setError('Şəbəkə xətası')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(range)
    const interval = setInterval(() => load(range, true), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [range, load])

  const funnelRows = useMemo(() => {
    if (!data?.events) return []
    const f = data.events.funnel
    const rows = [
      { label: 'Ziyarətçi (unikal)', value: f.visitors },
      { label: 'Qeydiyyat', value: f.registered },
      { label: 'Simulyasiya başladı', value: f.simulation_started },
      { label: 'Simulyasiya tamamladı', value: f.simulation_completed },
      { label: 'Premium aldı', value: f.premium_activated },
    ]
    const max = Math.max(1, ...rows.map((r) => r.value))
    return rows.map((r) => ({ ...r, pct: Math.round((r.value / max) * 100) }))
  }, [data])

  const roleData = useMemo(() => {
    if (!data) return []
    return [
      { name: 'Tələbə', value: data.totals.students },
      { name: 'HR', value: data.totals.hrUsers },
      { name: 'Kurs', value: data.totals.coursesUsers },
    ].filter((r) => r.value > 0)
  }, [data])

  const statsRow1: StatItem[] = data
    ? [
        { label: 'Ümumi istifadəçi', value: data.totals.totalUsers, icon: 'users', accent: 'forest' },
        { label: 'Yeni qeydiyyat', value: data.totals.newRegistrations, icon: 'trending', accent: 'coral', meta: 'seçilən dövrdə' },
        { label: 'Səhifə baxışı', value: data.events?.page_views ?? 0, icon: 'chart', accent: 'info', meta: data.events ? 'canlı tracking' : 'tracking aktiv deyil' },
        { label: 'Unikal ziyarətçi', value: data.events?.unique_visitors ?? 0, icon: 'target', accent: 'sun', meta: data.events ? 'anonim daxil' : 'tracking aktiv deyil' },
      ]
    : []

  const statsRow2: StatItem[] = data
    ? [
        { label: 'Sim. başladı', value: data.totals.attemptsStarted, icon: 'play', accent: 'forest' },
        { label: 'Sim. tamamlandı', value: data.totals.attemptsCompleted, icon: 'check', accent: 'success', meta: `tamamlama ${data.totals.completionRate}%` },
        { label: 'Orta bal', value: data.totals.avgScore ?? '—', icon: 'star', accent: 'sun' },
        { label: 'Premium', value: data.totals.premiumUsers, icon: 'zap', accent: 'coral', meta: `${data.totals.premiumActivations} aktivasiya dövrdə` },
      ]
    : []

  return (
    <div>
      <EditorialHero
        eyebrow="Platform Traction"
        title={
          <>
            Canlı <span className="italic font-light text-forest">traction</span> paneli
          </>
        }
        dek="Qeydiyyat, kliklər, simulyasiya funnel-i və premium conversion — hamısı bir yerdə, 30 saniyədə bir yenilənir."
        meta={
          lastUpdated
            ? [
                { label: 'Son yenilənmə', value: lastUpdated.toLocaleTimeString('az-AZ') },
                { label: 'Rejim', value: 'Canlı (30s)' },
              ]
            : undefined
        }
      />

      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              range === opt.value
                ? 'bg-forest text-cream border-forest'
                : 'bg-white text-ink-mid border-forest/12 hover:border-forest/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => load(range)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border border-forest/12 text-ink-mid hover:border-forest/30"
          aria-label="Yenilə"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Yenilə
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <Radio size={13} aria-hidden="true" />
          CANLI
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-6 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
          {error}
        </div>
      )}

      {data && !data.events && (
        <div className="mb-6 px-4 py-3 bg-sun-wash border border-sun/40 text-sun-deep text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
          Event tracking cədvəli tapılmadı — Supabase-də <code className="font-mono">SQL_ANALYTICS.sql</code> migration-ını işlədin.
          Biznes metrikaları (qeydiyyat, simulyasiya, premium) yenə də göstərilir.
        </div>
      )}

      {loading && !data ? (
        <div className="card p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-forest mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-ink-mid">Traction məlumatları yüklənir…</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          <StatGrid stats={statsRow1} />
          <StatGrid stats={statsRow2} />

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Traffic over time */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-1">Trafik dinamikası</h2>
              <p className="text-xs text-ink-mute mb-4">
                Səhifə baxışı və unikal ziyarətçi · tracking aktivləşən tarixdən etibarən
              </p>
              {data.events && data.events.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.events.daily}>
                    <XAxis dataKey="day" tick={{ fill: CHART_TICK, fontSize: 11 }} />
                    <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Legend />
                    <Line type="monotone" dataKey="page_views" name="Baxış" stroke="#1F4E4A" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="visitors" name="Ziyarətçi" stroke="#F47E47" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-mute py-12 text-center">Hələ event məlumatı yoxdur</p>
              )}
            </div>

            {/* Registrations over time */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-1">Qeydiyyat dinamikası</h2>
              <p className="text-xs text-ink-mute mb-4">
                users cədvəlindən · tracking-dən əvvəlki tarixçə də daxildir
              </p>
              {data.registrationsDaily.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.registrationsDaily}>
                    <XAxis dataKey="day" tick={{ fill: CHART_TICK, fontSize: 11 }} />
                    <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Bar dataKey="count" name="Qeydiyyat" fill="#1F4E4A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-mute py-12 text-center">Bu dövrdə qeydiyyat yoxdur</p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-1">Konversiya funnel-i</h2>
              <p className="text-xs text-ink-mute mb-5">ziyarət → qeydiyyat → simulyasiya → premium</p>
              {funnelRows.length > 0 ? (
                <div className="space-y-3">
                  {funnelRows.map((row, i) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-ink font-medium">{row.label}</span>
                        <span className="text-ink-mid font-semibold">{row.value}</span>
                      </div>
                      <div className="h-3 bg-cream-deep rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${row.pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-mute py-12 text-center">Funnel üçün event məlumatı yoxdur</p>
              )}
            </div>

            {/* Role breakdown */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-1">İstifadəçi bölgüsü</h2>
              <p className="text-xs text-ink-mute mb-4">rol üzrə bütün qeydiyyatlar</p>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-mute py-12 text-center">İstifadəçi yoxdur</p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top pages */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Ən çox baxılan səhifələr</h2>
              {data.events && data.events.top_pages.length > 0 ? (
                <div className="space-y-2">
                  {data.events.top_pages.map((p) => (
                    <div key={p.page_path} className="flex items-center justify-between py-2 border-b border-forest/8 last:border-0 text-sm">
                      <span className="font-mono text-xs text-ink truncate max-w-[60%]">{p.page_path}</span>
                      <span className="text-ink-mid">
                        <strong className="text-ink">{p.views}</strong> baxış · {p.visitors} ziyarətçi
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-mute py-8 text-center">Hələ səhifə baxışı yoxdur</p>
              )}
            </div>

            {/* Top events */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Ən çox baş verən hadisələr</h2>
              {data.events && data.events.top_events.length > 0 ? (
                <div className="space-y-2">
                  {data.events.top_events.map((e) => (
                    <div key={e.event_name} className="flex items-center justify-between py-2 border-b border-forest/8 last:border-0 text-sm">
                      <span className="font-mono text-xs text-ink">{e.event_name}</span>
                      <span className="font-semibold text-ink">{e.total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-mute py-8 text-center">Hələ interaction eventi yoxdur</p>
              )}
            </div>
          </div>

          {/* Secondary metrics */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Digər göstəricilər</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Aktiv istifadəçi</p>
                <p className="text-2xl font-semibold text-ink">{data.events?.active_users ?? '—'}</p>
              </div>
              <div>
                <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Interaction eventləri</p>
                <p className="text-2xl font-semibold text-ink">{data.events?.interaction_events ?? '—'}</p>
              </div>
              <div>
                <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Kurs qrupları</p>
                <p className="text-2xl font-semibold text-ink">{data.totals.groupCount}</p>
                <p className="text-xs text-ink-mute">{data.totals.groupMembers} üzv</p>
              </div>
              <div>
                <p className="text-ink-mute text-xs uppercase tracking-wider mb-1">Gəlir (dövrdə)</p>
                <p className="text-2xl font-semibold text-ink">
                  ${(data.totals.revenueCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-ink-mute">Stripe + promo aktivasiyalar</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
