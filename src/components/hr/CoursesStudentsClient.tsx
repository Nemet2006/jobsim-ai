'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  university: string | null
  email: string
  stats: { completed: number; total: number; avg: number }
}

export default function CoursesStudentsClient({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all')

  const filtered = students.filter((s) => {
    if (search && !s.full_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'completed' && s.stats.completed < s.stats.total) return false
    if (filter === 'not_started' && s.stats.completed > 0) return false
    if (filter === 'in_progress' && (s.stats.completed === 0 || s.stats.completed >= s.stats.total)) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Tələbələr</h1>
        <p className="text-slate-400 text-sm mt-1">{students.length} tələbə</p>
      </div>

      <div className="flex flex-wrap gap-3 glass-card p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad axtar..." className="input-dark w-full pl-8 text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'in_progress', 'not_started'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                filter === f ? 'border-teal-500/40 bg-teal-500/10 text-teal-400' : 'border-white/10 text-slate-400'
              }`}
            >
              {f === 'all' ? 'Hamısı' : f === 'completed' ? 'Tamamlanmış' : f === 'in_progress' ? 'Davam edir' : 'Başlanmamış'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Ad Soyad</th>
              <th className="text-left text-xs text-slate-400 font-medium px-5 py-3 hidden md:table-cell">Tapşırıqlar</th>
              <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Tərəqqi</th>
              <th className="text-left text-xs text-slate-400 font-medium px-5 py-3 hidden sm:table-cell">Orta bal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const pct = s.stats.total > 0 ? Math.round((s.stats.completed / s.stats.total) * 100) : 0
              return (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{s.full_name}</p>
                      {s.university && <p className="text-xs text-slate-400 mt-0.5">{s.university}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-sm text-slate-400">
                    {s.stats.completed}/{s.stats.total}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden min-w-16">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`text-sm font-bold ${s.stats.avg >= 71 ? 'text-green-400' : s.stats.avg >= 41 ? 'text-yellow-400' : s.stats.avg > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {s.stats.avg > 0 ? s.stats.avg : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-slate-400 py-8 text-sm">Tələbə tapılmadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
