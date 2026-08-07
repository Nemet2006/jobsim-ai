'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  RefreshCw,
  Radio,
  Download,
  UserPlus,
  LogIn,
  PlaySquare,
  Share2,
  MousePointerClick,
  AlertTriangle,
} from 'lucide-react'
import type { AdminAnalyticsSnapshot, RoleBreakdown } from '@/lib/admin-analytics'

const CHART_TICK = '#8A8A8A'
const CHART_TOOLTIP = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(22, 40, 61, 0.12)',
  borderRadius: '12px',
  color: '#15181D',
}

const RANGE_OPTIONS = [
  { value: '7d', label: '7 gün' },
  { value: '30d', label: '30 gün' },
  { value: '90d', label: '90 gün' },
  { value: 'all', label: 'Bütün dövr' },
]

const REFRESH_INTERVAL_MS = 30_000

const ROLE_LABELS = [
  { key: 'student' as const, label: 'Tələbə' },
  { key: 'hr' as const, label: 'HR' },
  { key: 'courses' as const, label: 'Kurs' },
]

function roleChartData(signUps: RoleBreakdown, signIns: RoleBreakdown) {
  return ROLE_LABELS.map(({ key, label }) => ({
    role: label,
    'Sign up': signUps[key],
    'Sign in': signIns[key],
  }))
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function CoreCard({
  icon: Icon,
  label,
  value,
  meta,
  accent = 'navy',
}: {
  icon: typeof UserPlus
  label: string
  value: number | string
  meta?: string
  accent?: 'navy' | 'gold' | 'verdigris' | 'info'
}) {
  const accents = {
    navy: 'bg-navy text-paper',
    gold: 'bg-gold text-navy-deep',
    verdigris: 'bg-verdigris text-paper',
    info: 'bg-info text-paper',
  }
  return (
    <article className="card-dossier p-5 flex flex-col gap-4 min-h-[140px]">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-mute text-right leading-snug">
          {label}
        </p>
      </div>
      <div>
        <p className="number-display text-4xl text-ink leading-none">{value}</p>
        {meta ? <p className="mt-2 text-xs text-ink-mute font-medium">{meta}</p> : null}
      </div>
    </article>
  )
}

function BreakdownBars({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="card-dossier p-6">
      <h2 className="font-display text-lg font-semibold text-ink mb-1">{title}</h2>
      <p className="text-xs text-ink-mute mb-5">Seçilmiş dövr üzrə</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-ink">{row.label}</span>
              <span className="number-display text-xl text-ink">{row.value}</span>
            </div>
            <div className="h-2.5 bg-paper-deep rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-700"
                style={{ width: `${Math.round((row.value / max) * 100)}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TractionDashboard() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState<AdminAnalyticsSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
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

  const authChart = useMemo(() => {
    if (!data) return []
    return roleChartData(data.core.signUps, data.core.signIns)
  }, [data])

  const downloadReport = async () => {
    setExporting(true)
    try {
      // Live report: server rebuilds stats at click time (not stale UI state).
      const res = await fetch(`/api/analytics/report?range=${range}`, { cache: 'no-store' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        setError(payload.error || 'Hesabat yaradılmadı')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      a.href = url
      a.download = `jobsim-admin-report-${range}-${stamp}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      // Refresh dashboard so UI matches the report snapshot window.
      load(range, true)
    } catch {
      setError('Hesabat endirilmədi')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="h-eyebrow mb-2">Platform Admin</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-ink tracking-tight">
              Core <span className="text-navy">statistikalar</span>
            </h1>
            <p className="mt-2 text-ink-mid text-sm lg:text-base leading-relaxed">
              Sign up / sign in, rollar, simulyasiya aktivliyi, tapşırıq paylaşımı və ümumi kliklər —
              yalnız əsas göstəricilər, canlı yenilənir.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-verdigris px-3 py-1.5 rounded-md bg-verdigris-wash border border-verdigris/20">
              <Radio size={13} aria-hidden="true" />
              CANLI
              {lastUpdated ? ` · ${formatTime(lastUpdated)}` : ''}
            </span>
            <button
              type="button"
              onClick={downloadReport}
              disabled={exporting || loading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Download size={15} aria-hidden="true" />
              {exporting ? 'Hesabat hazırlanır…' : 'Live report çıxar'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRange(opt.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              range === opt.value
                ? 'bg-navy text-paper border-navy'
                : 'bg-white text-ink-mid border-navy/12 hover:border-navy/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => load(range)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white border border-navy/12 text-ink-mid hover:border-navy/30"
          aria-label="Yenilə"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Yenilə
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
          {error}
        </div>
      )}

      {data && !data.events && (
        <div className="mb-6 px-4 py-3 bg-gold-wash border border-gold/40 text-gold-deep text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
          Event tracking tam aktiv deyil — sign-in / klik rəqəmləri məhdud ola bilər. Biznes cədvəlləri
          (sign up, simulyasiya, tapşırıq) yenə də canlıdır.
        </div>
      )}

      {loading && !data ? (
        <div className="card-dossier p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-navy mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-ink-mid">Core statistikalar yüklənir…</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Core KPI strip */}
          <section aria-labelledby="core-kpis">
            <h2 id="core-kpis" className="sr-only">
              Əsas göstəricilər
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <CoreCard
                icon={UserPlus}
                label="Sign up"
                value={data.core.signUps.total}
                meta="Yeni qeydiyyatlar"
                accent="navy"
              />
              <CoreCard
                icon={LogIn}
                label="Sign in"
                value={data.core.signIns.total}
                meta={`${data.core.loginFailed} uğursuz cəhd`}
                accent="gold"
              />
              <CoreCard
                icon={PlaySquare}
                label="Simulyasiya edənlər"
                value={data.core.uniqueSimulators}
                meta={`${data.core.simulationsStarted} cəhd · ${data.core.completionRate}% tamam`}
                accent="verdigris"
              />
              <CoreCard
                icon={Share2}
                label="Tapşırıq paylaşılan"
                value={data.core.tasksShared.total}
                meta="Kurs + qrup + yaradılan sim."
                accent="info"
              />
              <CoreCard
                icon={MousePointerClick}
                label="Ümumi klik"
                value={data.core.totalClicks}
                meta={`${data.core.pageViews} səhifə baxışı`}
                accent="navy"
              />
            </div>
          </section>

          {/* Auth by role */}
          <section className="grid lg:grid-cols-5 gap-6" aria-labelledby="auth-by-role">
            <div className="lg:col-span-3 card-dossier p-6">
              <h2 id="auth-by-role" className="font-display text-lg font-semibold text-ink mb-1">
                Rol üzrə Sign up / Sign in
              </h2>
              <p className="text-xs text-ink-mute mb-4">
                Hansı roldan neçə nəfər qeydiyyatdan keçib və daxil olub
              </p>
              {authChart.some((r) => r['Sign up'] > 0 || r['Sign in'] > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={authChart} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,40,61,0.08)" vertical={false} />
                    <XAxis dataKey="role" tick={{ fill: CHART_TICK, fontSize: 12 }} />
                    <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Legend />
                    <Bar dataKey="Sign up" fill="#16283D" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Sign in" fill="#B8862E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-mute py-16 text-center">Bu dövrdə auth məlumatı yoxdur</p>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="card-dossier p-5">
                <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold mb-3">
                  Sign up detalları
                </p>
                <ul className="space-y-2 text-sm">
                  {ROLE_LABELS.map(({ key, label }) => (
                    <li key={key} className="flex justify-between border-b border-navy/8 pb-2 last:border-0">
                      <span className="text-ink-mid">{label}</span>
                      <span className="font-semibold text-ink number-display text-lg">
                        {data.core.signUps[key]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-dossier p-5">
                <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold mb-3">
                  Sign in detalları
                </p>
                <ul className="space-y-2 text-sm">
                  {ROLE_LABELS.map(({ key, label }) => (
                    <li key={key} className="flex justify-between border-b border-navy/8 pb-2 last:border-0">
                      <span className="text-ink-mid">{label}</span>
                      <span className="font-semibold text-ink number-display text-lg">
                        {data.core.signIns[key]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Simulations + shares */}
          <section className="grid lg:grid-cols-2 gap-6">
            <BreakdownBars
              title="Simulyasiya aktivliyi"
              rows={[
                { label: 'Unikal simulyasiya edənlər', value: data.core.uniqueSimulators, color: '#1E7A63' },
                { label: 'Başlayan cəhdlər', value: data.core.simulationsStarted, color: '#16283D' },
                { label: 'Tamamlanan cəhdlər', value: data.core.simulationsCompleted, color: '#B8862E' },
              ]}
            />
            <BreakdownBars
              title="Tapşırıq / simulyasiya paylaşımı"
              rows={[
                {
                  label: 'Kurs tapşırıqları (tələbəyə)',
                  value: data.core.tasksShared.courseAssignments,
                  color: '#16283D',
                },
                {
                  label: 'Qrup simulyasiya tapşırıqları',
                  value: data.core.tasksShared.groupAssignments,
                  color: '#B8862E',
                },
                {
                  label: 'Yaradılan simulyasiyalar',
                  value: data.core.tasksShared.hrSimulationsCreated,
                  color: '#1E7A63',
                },
              ]}
            />
          </section>

          {/* Platform totals footer strip */}
          <section className="card-feature p-6 lg:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="h-eyebrow text-gold mb-1">Platform baza</p>
                <h2 className="font-display text-2xl font-semibold text-paper">
                  Ümumi istifadəçi bazası
                </h2>
              </div>
              <button
                type="button"
                onClick={downloadReport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold bg-gold text-navy-deep hover:bg-gold-deep transition-colors disabled:opacity-60"
              >
                <Download size={15} aria-hidden="true" />
                Live report (PDF)
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/55 mb-1">Ümumi user</p>
                <p className="number-display text-3xl text-paper">{data.totals.totalUsers}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/55 mb-1">Tələbə</p>
                <p className="number-display text-3xl text-paper">{data.totals.students}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/55 mb-1">HR</p>
                <p className="number-display text-3xl text-paper">{data.totals.hrUsers}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/55 mb-1">Kurs</p>
                <p className="number-display text-3xl text-paper">{data.totals.coursesUsers}</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-paper/50">
              Report hər dəfə basılanda server canlı statistikadan yeni snapshot hesablayır — UI-dakı köhnə
              rəqəmlərdən asılı deyil.
            </p>
          </section>
        </div>
      ) : null}
    </div>
  )
}
