'use client'

import { useMemo, useState } from 'react'
import {
  Download,
  Users,
  MousePointerClick,
  PlaySquare,
  Radio,
  Star,
  ExternalLink,
  Award,
  FileText,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  IMPACT_ACHIEVEMENTS,
  IMPACT_DAILY_ACTIVITY,
  IMPACT_DOCUMENTS,
  IMPACT_FEEDBACK,
  IMPACT_GROWTH,
  IMPACT_KPIS,
  IMPACT_META,
  IMPACT_RECENT_USERS,
  IMPACT_SCORE_DISTRIBUTION,
  IMPACT_SIM_RECORDS,
} from '@/lib/admin-impact-data'
import { MockDashboard, MockFeedback, MockLogin, MockSelect } from '@/components/admin/ui-mocks'

const CHART_TOOLTIP = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(22, 40, 61, 0.12)',
  borderRadius: '12px',
  color: '#15181D',
}

function Section({
  n,
  title,
  children,
  id,
}: {
  n: string
  title: string
  children: React.ReactNode
  id: string
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-lg bg-navy text-paper text-sm font-bold flex items-center justify-center">
          {n}
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white border border-navy/8 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function bakuNow(): string {
  return new Date().toLocaleString('az-AZ', {
    timeZone: 'Asia/Baku',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ImpactReportDashboard() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reportDate = useMemo(() => bakuNow(), [])

  const pieData = [
    { name: 'Bəli', value: IMPACT_FEEDBACK.recommendYes },
    { name: 'Xeyr', value: Math.round((100 - IMPACT_FEEDBACK.recommendYes) * 10) / 10 },
  ]

  async function downloadReport() {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics/report?range=30d&format=impact', {
        cache: 'no-store',
      })
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
      a.download = `jobsim-impact-hesabat-${stamp}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Hesabat endirilmədi')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-gold-deep mb-2">
              JobSim AI
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-ink tracking-tight">
              {IMPACT_META.titleAz}
            </h1>
            <p className="mt-2 text-sm text-ink-mid leading-relaxed">{IMPACT_META.tagline}</p>
          </div>
          <button
            type="button"
            onClick={downloadReport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy text-paper text-sm font-semibold hover:bg-navy-deep disabled:opacity-60"
          >
            <Download size={15} aria-hidden="true" />
            {exporting ? 'Hazırlanır…' : 'Tam hesabat (PDF)'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Users, label: 'İstifadəçi', value: IMPACT_KPIS.totalUsers },
            { icon: MousePointerClick, label: 'Engaged', value: IMPACT_KPIS.peopleEngaged },
            { icon: PlaySquare, label: 'Simulyasiya', value: IMPACT_KPIS.simulations },
            { icon: Radio, label: 'Status', value: IMPACT_META.status },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-xl bg-[#F4F7FA] border border-navy/6 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-navy text-paper flex items-center justify-center shrink-0">
                  <Icon size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                    {item.label}
                  </p>
                  <p className="font-display text-lg font-semibold text-ink">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-mute">
          <p>
            <span className="font-semibold text-ink-mid">Founder:</span> {IMPACT_META.founder}
          </p>
          <p>
            <span className="font-semibold text-ink-mid">Co-Founder:</span> {IMPACT_META.coFounder}
          </p>
          <p>
            <span className="font-semibold text-ink-mid">Tarix:</span> {reportDate}
          </p>
          <a
            href={IMPACT_META.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-navy font-medium hover:underline"
          >
            {IMPACT_META.siteUrl.replace('https://', '')}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
      </Card>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger-tint border border-danger/25 text-danger text-sm">
          {error}
        </div>
      )}

      {/* 1. Live product evidence */}
      <Section n="1" id="product" title="Live Product Evidence">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Giriş ekranı', node: <MockLogin /> },
            { title: 'İstifadəçi paneli', node: <MockDashboard /> },
            { title: 'Simulyasiya seçimi', node: <MockSelect /> },
            { title: 'AI feedback', node: <MockFeedback /> },
          ].map((s) => (
            <Card key={s.title} className="p-3">
              <p className="text-[11px] font-semibold text-ink-mute uppercase tracking-wider mb-2 px-1">
                {s.title}
              </p>
              <div className="aspect-[4/3]">{s.node}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 2. User statistics */}
      <Section n="2" id="users" title="İstifadəçi statistikası">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-4">
              Users Overview
            </p>
            <div className="space-y-4">
              {[
                { label: 'Total Users', value: IMPACT_KPIS.totalUsers },
                { label: 'Active Users', value: IMPACT_KPIS.activeUsers },
                { label: 'New Users (30g)', value: IMPACT_KPIS.newUsers30d },
              ].map((r) => (
                <div key={r.label} className="flex items-end justify-between border-b border-navy/8 pb-3 last:border-0">
                  <span className="text-sm text-ink-mid">{r.label}</span>
                  <span className="number-display text-3xl text-ink">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-2">
              User Growth
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={IMPACT_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,40,61,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8A8A8A', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Qeydiyyat (cumul.)"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3B82F6' }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Aktiv user"
                  stroke="#B8862E"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#B8862E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="mt-4 p-5">
          <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-2">
            Son 14 gün — trafik & simulyasiya
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={IMPACT_DAILY_ACTIVITY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,40,61,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8A8A8A', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8A8A8A', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Legend />
              <Bar dataKey="views" name="Səhifə baxışı" fill="#16283D" radius={[3, 3, 0, 0]} />
              <Bar dataKey="sims" name="Sim. tamam" fill="#1E7A63" radius={[3, 3, 0, 0]} />
              <Bar dataKey="signups" name="Sign up" fill="#B8862E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-mute border-b border-navy/8">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Təşkilat</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {IMPACT_RECENT_USERS.map((u) => (
                <tr key={u.email} className="border-b border-navy/6 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-ink-mid font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-ink-mid text-xs">{u.university}</td>
                  <td className="px-4 py-3 text-ink-mid">{u.role}</td>
                  <td className="px-4 py-3 text-ink-mute whitespace-nowrap">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      {/* 3. Simulations */}
      <Section n="3" id="simulations" title="Simulyasiya qeydləri">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 overflow-x-auto">
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
                      <p className="font-medium text-ink">{s.candidate}</p>
                      <p className="font-mono text-[10px] text-ink-mute">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-mid">{s.type}</td>
                    <td className="px-4 py-3 text-ink-mid whitespace-nowrap text-xs">{s.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-[3rem] justify-center rounded-md bg-verdigris-wash text-verdigris font-semibold px-2 py-0.5">
                        {s.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-4">
                Son nəticə
              </p>
              <div className="relative w-28 h-28 rounded-full border-[6px] border-verdigris flex items-center justify-center mb-3">
                <span className="number-display text-3xl text-ink">88</span>
              </div>
              <p className="font-display font-semibold text-ink">Aysel Məmmədova</p>
              <p className="text-xs text-ink-mute mt-0.5">Backend Developer · 06.08.2026</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-3">
                Bal paylanması
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={IMPACT_SCORE_DISTRIBUTION} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="range"
                    width={58}
                    tick={{ fill: '#8A8A8A', fontSize: 10 }}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="count" name="Nəfər" fill="#16283D" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </Section>

      {/* 4. Feedback */}
      <Section n="4" id="feedback" title="İstifadəçi feedback">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold">Responses</p>
              <p className="number-display text-4xl text-ink mt-1">{IMPACT_FEEDBACK.responses}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold">Avg rating</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-2xl font-semibold text-ink">
                <Star size={18} className="text-gold fill-gold" aria-hidden="true" />
                {IMPACT_FEEDBACK.avgRating}
                <span className="text-sm text-ink-mute font-normal">/ 5</span>
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold mb-2">
              Tövsiyə edərdiniz?
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                  <Cell fill="#1E7A63" />
                  <Cell fill="#D9DEE5" />
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm font-semibold text-verdigris">
              {IMPACT_FEEDBACK.recommendYes}% Bəli
            </p>
          </Card>

          <Card className="p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold">
              İstifadəçi rəyləri
            </p>
            {IMPACT_FEEDBACK.liked.slice(0, 3).map((q) => (
              <blockquote
                key={`${q.author}-${q.date}`}
                className="text-sm text-ink-mid leading-snug border-l-2 border-gold pl-3"
              >
                <p>“{q.text}”</p>
                <footer className="mt-1.5 text-[11px] text-ink-mute">
                  {q.author} · {q.role} · {q.date}
                </footer>
              </blockquote>
            ))}
          </Card>
        </div>
      </Section>

      {/* 5. Impact metrics */}
      <Section n="5" id="impact" title="Impact Metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Registered Users', value: IMPACT_KPIS.totalUsers },
            { label: 'People Engaged', value: IMPACT_KPIS.peopleEngaged },
            { label: 'Sims Completed', value: IMPACT_KPIS.simulationsCompleted },
            { label: 'Satisfaction', value: `${IMPACT_FEEDBACK.avgRating}/5` },
            { label: 'Sign up (30g)', value: IMPACT_KPIS.signUps30d },
            { label: 'Sign in (30g)', value: IMPACT_KPIS.signIns30d },
            { label: 'Tapşırıq paylaşımı', value: IMPACT_KPIS.tasksShared },
            { label: 'Ümumi klik', value: IMPACT_KPIS.totalClicks },
          ].map((m) => (
            <Card key={m.label} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                {m.label}
              </p>
              <p className="number-display text-3xl text-ink mt-2">{m.value}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 6. Achievements */}
      <Section n="6" id="achievements" title="Startup proqram nailiyyətləri">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {IMPACT_ACHIEVEMENTS.map((a) => (
            <Card key={a.title} className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gold/15 rounded-bl-[2rem]" />
              <Award className="text-gold mb-3" size={22} aria-hidden="true" />
              <p className="font-display font-semibold text-ink leading-snug">{a.title}</p>
              <p className="text-xs text-ink-mute mt-1">{a.subtitle}</p>
              <p className="text-[11px] font-semibold text-navy mt-3">{a.year}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 7. Documents */}
      <Section n="7" id="documents" title="Supporting Documents">
        <Card className="divide-y divide-navy/8">
          {IMPACT_DOCUMENTS.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-navy shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{d.label}</p>
                  <p className="text-xs text-ink-mute truncate">{d.value}</p>
                </div>
              </div>
              {d.kind === 'link' && d.value.startsWith('http') ? (
                <a
                  href={d.value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-navy inline-flex items-center gap-1 shrink-0"
                >
                  Aç <ExternalLink size={12} aria-hidden="true" />
                </a>
              ) : d.kind === 'link' ? (
                <a href={d.value} className="text-xs font-semibold text-navy shrink-0">
                  Keç
                </a>
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                  File
                </span>
              )}
            </div>
          ))}
        </Card>
      </Section>

      <Card className="p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          JobSim AI — real bacarıq, sübut olunmuş nəticə.
        </p>
        <p className="text-sm text-ink-mute mt-1">Thank you!</p>
      </Card>
    </div>
  )
}
