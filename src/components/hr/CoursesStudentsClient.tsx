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
        <h1 className="font-display text-2xl font-semibold text-ink">Tələbələr</h1>
        <p className="text-ink-mute text-sm mt-1">{students.length} tələbə</p>
      </div>

      <div className="flex flex-wrap gap-3 card-dossier p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad axtar..." className="input-dark w-full pl-8 text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'in_progress', 'not_started'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                filter === f ? 'border-navy/30 bg-navy-wash text-navy' : 'border-navy/10 text-ink-mute'
              }`}
            >
              {f === 'all' ? 'Hamısı' : f === 'completed' ? 'Tamamlanmış' : f === 'in_progress' ? 'Davam edir' : 'Başlanmamış'}
            </button>
          ))}
        </div>
      </div>

      <div className="card-dossier overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy/8">
              <th className="text-left text-xs text-ink-mute font-medium px-5 py-3">Ad Soyad</th>
              <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden md:table-cell">Tapşırıqlar</th>
              <th className="text-left text-xs text-ink-mute font-medium px-5 py-3">Tərəqqi</th>
              <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden sm:table-cell">Orta bal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const pct = s.stats.total > 0 ? Math.round((s.stats.completed / s.stats.total) * 100) : 0
              return (
                <tr key={s.id} className="border-b border-navy/8 hover:bg-navy-wash/60 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{s.full_name}</p>
                      {s.university && <p className="text-xs text-ink-mute mt-0.5">{s.university}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-sm text-ink-mute">
                    {s.stats.completed}/{s.stats.total}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-paper-deep rounded-md overflow-hidden min-w-16">
                        <div
                          className="h-full bg-verdigris rounded-md transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-mute w-8">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`text-sm font-bold ${s.stats.avg >= 71 ? 'text-verdigris' : s.stats.avg >= 41 ? 'text-gold-deep' : s.stats.avg > 0 ? 'text-danger' : 'text-ink-mute'}`}>
                      {s.stats.avg > 0 ? s.stats.avg : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-ink-mute py-8 text-sm">Tələbə tapılmadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
