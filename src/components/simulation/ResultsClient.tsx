'use client'

import { useState } from 'react'
import { formatDate, getScoreColor, getScoreColorHex } from '@/lib/utils'
import type { SimulationAttempt, AIAnalysis } from '@/types'
import { Trophy, Target, TrendingUp, AlertCircle, X, CheckCircle, XCircle } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { CertificateCard } from './CertificateCard'

type AttemptRow = SimulationAttempt & {
  simulation: {
    title: string
    role_type: string
    difficulty: string
    creator?: { company_name: string | null } | null
  } | null
}

interface ResultsClientProps {
  attempts: AttemptRow[]
  highlighted: AttemptRow | null
  showCancelled: boolean
  studentName: string
}

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColorHex(score)

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(31,78,74,0.12)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-display font-semibold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-ink-mute">/ 100</span>
      </div>
    </div>
  )
}

export default function ResultsClient({ attempts, highlighted, showCancelled, studentName }: ResultsClientProps) {
  const [selected, setSelected] = useState<typeof attempts[0] | null>(highlighted)
  const [activeTab, setActiveTab] = useState<'strengths' | 'weaknesses' | 'advice' | 'detailed'>('strengths')

  const completed = attempts.filter((a) => a.status === 'completed')
  const bestScore = completed.length ? Math.max(...completed.map((a) => a.score || 0)) : 0
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
    : 0

  return (
    <div className="space-y-8">
      {showCancelled && (
        <div className="bg-danger-tint border border-danger/25 text-danger px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} aria-hidden="true" />
          Simulyasiya ləğv edildi. Çox dəfə ekrandan çıxdınız.
        </div>
      )}

      <EditorialHero
        eyebrow="Performans"
        title={
          <>
            Nəticələrim<span className="text-coral">.</span>
          </>
        }
        dek={`${completed.length} tamamlanmış simulyasiya · orta bal ${avgScore}`}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <Trophy size={20} className="text-sun-deep mx-auto mb-2" aria-hidden="true" />
          <p className="number-display text-3xl font-semibold text-ink">{bestScore}</p>
          <p className="text-xs text-ink-mute font-medium mt-1">Ən yüksək bal</p>
        </div>
        <div className="card p-5 text-center">
          <Target size={20} className="text-forest mx-auto mb-2" aria-hidden="true" />
          <p className="number-display text-3xl font-semibold text-ink">{avgScore}</p>
          <p className="text-xs text-ink-mute font-medium mt-1">Orta bal</p>
        </div>
        <div className="card p-5 text-center">
          <TrendingUp size={20} className="text-coral-deep mx-auto mb-2" aria-hidden="true" />
          <p className="number-display text-3xl font-semibold text-ink">{completed.length}</p>
          <p className="text-xs text-ink-mute font-medium mt-1">Tamamlanmış</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Tarixçə</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {attempts.map((attempt) => (
              <button
                key={attempt.id}
                onClick={() => { setSelected(attempt); setActiveTab('strengths') }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selected?.id === attempt.id
                    ? 'border-forest bg-forest-wash'
                    : 'border-transparent bg-cream-paper hover:border-forest/15 hover:bg-forest-wash/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {attempt.simulation?.title || 'Simulyasiya'}
                    </p>
                    <p className="text-xs text-ink-mute mt-0.5">
                      {formatDate(attempt.started_at)} • {attempt.simulation?.role_type}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {attempt.status === 'completed' && attempt.score !== null ? (
                      <span className={`text-lg font-display font-semibold ${getScoreColor(attempt.score)}`}>
                        {attempt.score}
                      </span>
                    ) : attempt.status === 'cancelled' ? (
                      <XCircle size={18} className="text-danger" aria-hidden="true" />
                    ) : (
                      <span className="tag-coral text-[10px]">Davam edir</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {attempts.length === 0 && (
              <p className="text-ink-mid text-sm text-center py-8">Hələ heç bir cəhd yoxdur</p>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && selected.status === 'completed' && selected.ai_analysis ? (
          <div className="space-y-4">
            <CertificateCard
              data={{
                studentName,
                simulationTitle: selected.simulation?.title || 'Simulyasiya',
                roleType: selected.simulation?.role_type || '',
                companyName: selected.simulation?.creator?.company_name,
                score: selected.score!,
                completedAt: selected.completed_at || selected.started_at,
                attemptId: selected.id,
              }}
            />

            <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink truncate">{selected.simulation?.title}</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full hover:bg-forest-wash flex items-center justify-center text-ink-mute hover:text-forest"
                aria-label="Bağla"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <ScoreCircle score={selected.score!} />

            <div className="flex gap-1 mt-6 bg-cream-deep rounded-xl p-1">
              {(['strengths', 'weaknesses', 'advice', 'detailed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-forest shadow-soft-sm'
                      : 'text-ink-mute hover:text-forest'
                  }`}
                >
                  {tab === 'strengths' ? 'Güclü' : tab === 'weaknesses' ? 'Zəif' : tab === 'advice' ? 'Tövsiyə' : 'Analiz'}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {activeTab === 'strengths' && (selected.ai_analysis as unknown as AIAnalysis).strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-success-tint border border-success/20 rounded-xl">
                  <CheckCircle size={14} className="text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-ink leading-relaxed">{s}</p>
                </div>
              ))}
              {activeTab === 'weaknesses' && (selected.ai_analysis as unknown as AIAnalysis).weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-danger-tint border border-danger/20 rounded-xl">
                  <XCircle size={14} className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-ink leading-relaxed">{w}</p>
                </div>
              ))}
              {activeTab === 'advice' && (selected.ai_analysis as unknown as AIAnalysis).advice.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-info-tint border border-info/20 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-info/20 text-info text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-xs text-ink leading-relaxed">{a}</p>
                </div>
              ))}
              {activeTab === 'detailed' && (
                <p className="text-sm text-ink-mid leading-relaxed p-3 bg-cream-paper rounded-xl border border-forest/8">
                  {(selected.ai_analysis as unknown as AIAnalysis).detailed_feedback}
                </p>
              )}
            </div>
            </div>
          </div>
        ) : (
          <div className="card p-5 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Target size={40} className="text-forest/30 mx-auto mb-3" aria-hidden="true" />
              <p className="text-ink-mid text-sm">Detallı analiz üçün bir nəticəyə klikləyin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
