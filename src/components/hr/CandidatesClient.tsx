'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getScoreColor } from '@/lib/utils'
import type { AIAnalysis } from '@/types'
import { Search, Star, StarOff, X, CheckCircle, XCircle, Filter } from 'lucide-react'

interface Candidate {
  attempt_id: string
  student_id: string
  simulation_id: string
  score: number | null
  started_at: string
  ai_analysis: Record<string, unknown> | null
  student_name: string
  university: string | null
  simulation_title: string
  is_shortlisted: boolean
}

interface CandidatesClientProps {
  candidates: Candidate[]
  hrId: string
}

export default function CandidatesClient({ candidates, hrId }: CandidatesClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [scoreMin, setScoreMin] = useState(0)
  const [scoreMax, setScoreMax] = useState(100)
  const [shortlistOnly, setShortlistOnly] = useState(false)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [localShortlist, setLocalShortlist] = useState<Set<string>>(
    new Set(candidates.filter((c) => c.is_shortlisted).map((c) => c.attempt_id))
  )

  const filtered = candidates.filter((c) => {
    if (search && !c.student_name.toLowerCase().includes(search.toLowerCase())) return false
    if (c.score !== null && (c.score < scoreMin || c.score > scoreMax)) return false
    if (shortlistOnly && !localShortlist.has(c.attempt_id)) return false
    return true
  })

  async function toggleShortlist(c: Candidate) {
    const isIn = localShortlist.has(c.attempt_id)
    if (isIn) {
      setLocalShortlist((prev) => { const next = new Set(prev); next.delete(c.attempt_id); return next })
      await supabase.from('shortlist').delete().eq('hr_id', hrId).eq('attempt_id', c.attempt_id)
    } else {
      setLocalShortlist((prev) => new Set([...prev, c.attempt_id]))
      await supabase.from('shortlist').upsert({
        hr_id: hrId,
        student_id: c.student_id,
        simulation_id: c.simulation_id,
        attempt_id: c.attempt_id,
      })
    }
    startTransition(() => router.refresh())
  }

  const analysis = selected?.ai_analysis as unknown as AIAnalysis | null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Namizədlər</h1>
        <p className="text-ink-mute text-sm mt-1">{filtered.length} / {candidates.length} namizəd</p>
      </div>

      {/* Filters */}
      <div className="card-dossier p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-ink-mute" />
          <span className="text-xs text-ink-mute font-medium">Filterlər</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad axtar..."
              className="input-dark w-full pl-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-mute">Bal:</span>
            <input type="number" value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value))} min={0} max={100} className="input-dark w-16 text-sm text-center" />
            <span className="text-ink-mute">—</span>
            <input type="number" value={scoreMax} onChange={(e) => setScoreMax(Number(e.target.value))} min={0} max={100} className="input-dark w-16 text-sm text-center" />
          </div>
          <button
            onClick={() => setShortlistOnly(!shortlistOnly)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
              shortlistOnly ? 'border-gold/40 bg-gold-wash text-gold-deep' : 'border-navy/10 text-ink-mute hover:border-navy/20'
            }`}
          >
            <Star size={12} />
            Yalnız Shortlist
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 card-dossier overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/8">
                <th className="text-left text-xs text-ink-mute font-medium px-4 py-3">Ad Soyad</th>
                <th className="text-left text-xs text-ink-mute font-medium px-4 py-3 hidden md:table-cell">Simulyasiya</th>
                <th className="text-left text-xs text-ink-mute font-medium px-4 py-3">Bal</th>
                <th className="text-left text-xs text-ink-mute font-medium px-4 py-3 hidden sm:table-cell">Tarix</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.attempt_id}
                  className={`border-b border-navy/8 cursor-pointer transition-colors ${
                    selected?.attempt_id === c.attempt_id ? 'bg-navy-wash' : 'hover:bg-navy-wash/60'
                  }`}
                  onClick={() => setSelected(c)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{c.student_name}</p>
                      {c.university && <p className="text-xs text-ink-mute">{c.university}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-ink-mute max-w-[160px] truncate">
                    {c.simulation_title}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-base font-bold ${c.score !== null ? getScoreColor(c.score) : 'text-ink-mute'}`}>
                      {c.score ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-ink-mute">
                    {formatDate(c.started_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleShortlist(c) }}
                      className={localShortlist.has(c.attempt_id) ? 'text-gold-deep' : 'text-ink-mute hover:text-gold-deep'}
                    >
                      {localShortlist.has(c.attempt_id) ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-ink-mute py-8 text-sm">Namizəd tapılmadı</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Profile Drawer */}
        {selected ? (
          <div className="card-dossier p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">Profil</h3>
              <button onClick={() => setSelected(null)} className="text-ink-mute hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-navy-wash border border-navy/25 flex items-center justify-center text-navy font-bold text-xl mx-auto mb-2">
                {selected.student_name[0]}
              </div>
              <p className="font-semibold text-ink">{selected.student_name}</p>
              {selected.university && <p className="text-xs text-ink-mute mt-1">{selected.university}</p>}
              {selected.score !== null && (
                <div className={`text-4xl font-bold mt-3 ${getScoreColor(selected.score)}`}>
                  {selected.score}
                  <span className="text-base text-ink-mute">/100</span>
                </div>
              )}
            </div>

            {analysis && (
              <div className="space-y-3">
                <div className="p-3 bg-verdigris-wash border border-verdigris/25 rounded-lg">
                  <p className="text-xs font-medium text-verdigris mb-2">Güclü Tərəflər</p>
                  {analysis.strengths?.slice(0, 2).map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 mt-1">
                      <CheckCircle size={11} className="text-verdigris flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-ink-mid">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-danger-tint border border-danger/25 rounded-lg">
                  <p className="text-xs font-medium text-danger mb-2">Zəif Tərəflər</p>
                  {analysis.weaknesses?.slice(0, 2).map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 mt-1">
                      <XCircle size={11} className="text-danger flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-ink-mid">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => toggleShortlist(selected)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                localShortlist.has(selected.attempt_id)
                  ? 'border-gold/40 bg-gold-wash text-gold-deep hover:bg-gold-wash'
                  : 'border-navy/30 bg-navy-wash text-navy hover:bg-navy-wash'
              }`}
            >
              {localShortlist.has(selected.attempt_id) ? (
                <><StarOff size={15} /> Shortlistdən Çıxar</>
              ) : (
                <><Star size={15} /> Shortlist-ə Əlavə Et</>
              )}
            </button>
          </div>
        ) : (
          <div className="card-dossier p-5 flex items-center justify-center">
            <p className="text-ink-mute text-sm text-center">Detallı məlumat üçün bir namizəd seçin</p>
          </div>
        )}
      </div>
    </div>
  )
}
