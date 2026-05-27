'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts'
import { getScoreColor } from '@/lib/utils'
import type { AIAnalysis } from '@/types'
import { CheckCircle, XCircle, Trophy } from 'lucide-react'

interface CandidateCompare {
  shortlist_id: string
  score: number | null
  ai_analysis: Record<string, unknown> | null
  student_name: string
  university: string | null
  role_type: string
}

const RADAR_COLORS = ['#0D9488', '#3B82F6', '#A855F7', '#F59E0B']
const SKILL_LABELS: Record<string, string> = {
  communication: 'Ünsiyyət',
  problem_solving: 'Problem Həll',
  analytical_thinking: 'Analitik',
  structure: 'Struktur',
  creativity: 'Yaradıcılıq',
}

export default function CompareClient({ candidates }: { candidates: CandidateCompare[] }) {
  if (candidates.length < 2) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Müqayisə üçün Shortlist səhifəsindən ən az 2 namizəd seçin</p>
      </div>
    )
  }

  const maxScore = Math.max(...candidates.map((c) => c.score ?? 0))

  const radarData = ['communication', 'problem_solving', 'analytical_thinking', 'structure', 'creativity'].map((key) => {
    const entry: Record<string, string | number> = { skill: SKILL_LABELS[key] || key }
    candidates.forEach((c) => {
      const analysis = c.ai_analysis as unknown as AIAnalysis | null
      entry[c.student_name] = analysis?.skill_scores?.[key as keyof typeof analysis.skill_scores] ?? 0
    })
    return entry
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Müqayisə</h1>

      {/* Side-by-side */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
        {candidates.map((c, i) => {
          const analysis = c.ai_analysis as unknown as AIAnalysis | null
          const isBest = c.score === maxScore

          return (
            <div key={c.shortlist_id} className={`glass-card p-5 space-y-4 ${isBest ? 'border-teal-500/30' : ''}`}>
              {isBest && (
                <div className="flex items-center gap-1.5 text-xs text-teal-400">
                  <Trophy size={12} />
                  Ən yüksək bal
                </div>
              )}
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-bold mx-auto mb-2"
                  style={{ borderColor: RADAR_COLORS[i], color: RADAR_COLORS[i], backgroundColor: `${RADAR_COLORS[i]}20` }}>
                  {c.student_name[0]}
                </div>
                <p className="font-semibold text-white">{c.student_name}</p>
                {c.university && <p className="text-xs text-slate-400 mt-0.5">{c.university}</p>}
              </div>

              <div className="text-center">
                <span className={`text-4xl font-bold ${c.score !== null ? getScoreColor(c.score) : 'text-slate-400'}`}>
                  {c.score ?? '—'}
                </span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>

              {analysis && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-1">Güclü Tərəflər</p>
                    {analysis.strengths?.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 mt-1">
                        <CheckCircle size={10} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300">{s}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1">Zəif Tərəflər</p>
                    {analysis.weaknesses?.slice(0, 1).map((w, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 mt-1">
                        <XCircle size={10} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300">{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary w-full text-sm">Bu Namizədi Seç</button>
            </div>
          )
        })}
      </div>

      {/* Radar Chart */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Bacarıq Müqayisəsi</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            {candidates.map((c, i) => (
              <Radar
                key={c.shortlist_id}
                name={c.student_name}
                dataKey={c.student_name}
                stroke={RADAR_COLORS[i]}
                fill={RADAR_COLORS[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
