'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { Download, FileText } from 'lucide-react'
import { track } from '@/lib/analytics-client'

interface ReportsClientProps {
  companyName: string
  simulations: { id: string; title: string; role_type: string }[]
  attempts: { score: number | null; started_at: string; simulation_id: string; student_id: string; student_name: string; university: string | null }[]
  shortlistCount: number
}

const CHART_COLORS = ['#1F4E4A', '#F47E47', '#3B82F6', '#F5C842', '#22A06B']
const CHART_TICK = '#8A8A8A'
const CHART_TOOLTIP = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(31, 78, 74, 0.12)',
  borderRadius: '12px',
  color: '#1A1A1A',
}

export default function ReportsClient({ companyName, simulations, attempts, shortlistCount }: ReportsClientProps) {
  const totalCandidates = new Set(attempts.map((a) => a.student_id)).size
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length)
    : 0

  // Bar chart: avg score by role type
  const roleGroups: Record<string, number[]> = {}
  attempts.forEach((a) => {
    const sim = simulations.find((s) => s.id === a.simulation_id)
    if (sim && a.score !== null) {
      if (!roleGroups[sim.role_type]) roleGroups[sim.role_type] = []
      roleGroups[sim.role_type].push(a.score)
    }
  })
  const barData = Object.entries(roleGroups).map(([role, scores]) => ({
    role: role.length > 15 ? role.slice(0, 13) + '…' : role,
    avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
  }))

  // Line chart: attempts over time (last 30 days)
  const lineMap: Record<string, number> = {}
  attempts.forEach((a) => {
    const date = new Date(a.started_at).toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' })
    lineMap[date] = (lineMap[date] || 0) + 1
  })
  const lineData = Object.entries(lineMap).slice(-10).map(([date, count]) => ({ date, count }))

  // Pie: shortlist ratio
  const pieData = [
    { name: 'Shortlistdə', value: shortlistCount },
    { name: 'Digər', value: Math.max(0, totalCandidates - shortlistCount) },
  ]

  async function downloadPDF() {
    track('hr_report_downloaded')
    const res = await fetch('/api/reports/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        stats: { totalCandidates, avgScore, shortlistCount, totalAttempts: attempts.length },
        candidates: attempts.slice(0, 20),
      }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${companyName}-hesabat.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hesabatlar</h1>
          <p className="text-slate-400 text-sm mt-1">{companyName}</p>
        </div>
        <button onClick={downloadPDF} className="btn-primary flex items-center gap-2">
          <Download size={16} />
          PDF Çıxar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ümumi Cəhd', value: attempts.length },
          { label: 'Unikal Namizəd', value: totalCandidates },
          { label: 'Orta Bal', value: avgScore },
          { label: 'Shortlistdə', value: shortlistCount },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={15} className="text-forest" />
            Rol tipinə görə orta bal
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="role" tick={{ fill: CHART_TICK, fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: CHART_TICK, fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Bar dataKey="avg" fill="#1F4E4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-8">Məlumat yoxdur</p>}
        </div>

        {/* Line Chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={15} className="text-forest" />
            Namizəd sayı (son 10 gün)
          </h2>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" tick={{ fill: CHART_TICK, fontSize: 10 }} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Line type="monotone" dataKey="count" stroke="#1F4E4A" strokeWidth={2} dot={{ fill: '#F47E47', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-8">Məlumat yoxdur</p>}
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={15} className="text-forest" />
            Shortlist nisbəti
          </h2>
          {totalCandidates > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={true}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-8">Məlumat yoxdur</p>}
        </div>

        {/* Top Simulations */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={15} className="text-forest" />
            Simulyasiya performansı
          </h2>
          <div className="space-y-3">
            {simulations.slice(0, 5).map((sim) => {
              const simAttempts = attempts.filter((a) => a.simulation_id === sim.id)
              const avg = simAttempts.length
                ? Math.round(simAttempts.reduce((s, a) => s + (a.score || 0), 0) / simAttempts.length)
                : 0
              return (
                <div key={sim.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{sim.title}</p>
                    <p className="text-xs text-slate-500">{simAttempts.length} namizəd</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-forest">{avg}</p>
                  </div>
                </div>
              )
            })}
            {simulations.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Məlumat yoxdur</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
