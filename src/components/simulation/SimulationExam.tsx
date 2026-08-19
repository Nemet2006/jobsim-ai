'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProctorCamera } from './ProctorCamera'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import { normalizeQuestions } from '@/lib/questions'
import { hasQuestionAnswer, questionTypeLabel } from '@/lib/answers'
import { QuestionAnswerInput } from './QuestionAnswerInput'
import type { Question } from '@/types'
import { CertificateCard } from './CertificateCard'
import { useT } from '@/i18n/I18nProvider'
import {
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShieldCheck,
  Cpu,
} from 'lucide-react'

interface SimulationExamProps {
  simulation: {
    id: string
    title: string
    role_type: string
    duration_minutes: number
    questions: Question[]
  }
  attemptId: string
  studentId: string
  studentName: string
  companyName?: string | null
}

type ExamPhase = 'exam' | 'analyzing' | 'done' | 'error'

export default function SimulationExam({
  simulation,
  attemptId,
  studentId,
  studentName,
  companyName,
}: SimulationExamProps) {
  const { t } = useT()
  const router = useRouter()
  const supabase = createClient()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [cheatCount, setCheatCount] = useState(0)
  const [showCheatWarning, setShowCheatWarning] = useState(false)
  const [phase, setPhase] = useState<ExamPhase>('exam')
  const [timeLeft, setTimeLeft] = useState(simulation.duration_minutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [finalCompletedAt, setFinalCompletedAt] = useState<string | null>(null)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const cheatCountRef = useRef(0)

  const ANALYZE_STEPS = [
    t('sim.analyzing1'),
    t('sim.analyzing2'),
    t('sim.analyzing3'),
    t('sim.analyzing4'),
  ]

  const questions = normalizeQuestions(simulation.questions)

  useEffect(() => {
    track('simulation_exam_started', {
      simulation_id: simulation.id,
      attempt_id: attemptId,
      question_count: questions.length,
      duration_minutes: simulation.duration_minutes,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'analyzing') return
    setAnalyzeStep(0)
    const id = setInterval(() => {
      setAnalyzeStep((s) => (s < ANALYZE_STEPS.length - 1 ? s + 1 : s))
    }, 2200)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCheat = useCallback(async () => {
    cheatCountRef.current += 1
    setCheatCount(cheatCountRef.current)
    setShowCheatWarning(true)
    setTimeout(() => setShowCheatWarning(false), 3000)
    track('simulation_cheat_detected', {
      simulation_id: simulation.id,
      attempt_id: attemptId,
      cheat_count: cheatCountRef.current,
    })

    await supabase
      .from('simulation_attempts')
      .update({ cheat_attempts: cheatCountRef.current })
      .eq('id', attemptId)

    if (cheatCountRef.current >= 3) {
      await supabase
        .from('simulation_attempts')
        .update({ status: 'cancelled' })
        .eq('id', attemptId)
      router.push('/student/results?cancelled=true')
    }
  }, [attemptId, router, supabase, simulation.id])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setAnalyzeError(null)
    setPhase('analyzing')
    track('simulation_submitted', {
      simulation_id: simulation.id,
      attempt_id: attemptId,
    })

    await supabase
      .from('simulation_attempts')
      .update({ answers })
      .eq('id', attemptId)

    try {
      const res = await fetch('/api/attempts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })
      const analysis = await res.json()

      if (!res.ok || typeof analysis.score !== 'number') {
        throw new Error(analysis.error || 'AI analizi uğursuz oldu')
      }

      const completedAt = analysis.completed_at || new Date().toISOString()
      setFinalScore(analysis.score)
      setFinalCompletedAt(completedAt)
      setPhase('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI analizi uğursuz oldu'
      track('simulation_exam_failed', {
        simulation_id: simulation.id,
        attempt_id: attemptId,
      })
      setAnalyzeError(message)
      setPhase('error')
      setSubmitting(false)
    }
  }, [answers, attemptId, simulation.id, supabase, submitting])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((currentQ + 1) / questions.length) * 100
  const answeredCount = questions.filter((q) => hasQuestionAnswer(answers, q)).length

  if (phase === 'analyzing') {
    return (
      <div className="fixed inset-0 exam-shell flex flex-col items-center justify-center z-50 px-4">
        <div className="exam-card max-w-md w-full !pl-7">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-gold font-semibold">
              Assessment engine
            </span>
          </div>

          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-md border border-white/10" />
            <div className="absolute inset-0 rounded-md border-2 border-gold border-t-transparent animate-spin" />
            <Cpu size={22} className="absolute inset-0 m-auto text-gold" aria-hidden="true" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-paper mb-2">
            {t('sim.analyzing')}
          </h2>
          <p className="text-sm text-white/55 leading-relaxed mb-6">
            OpenRouter üzərindən real AI modeli cavablarınızı oxuyur, skor və bacarıq hesabatı hazırlayır.
            Bu addım bir neçə saniyə çəkə bilər.
          </p>

          <ol className="space-y-2.5 mb-6">
            {ANALYZE_STEPS.map((step, i) => {
              const done = i < analyzeStep
              const active = i === analyzeStep
              return (
                <li
                  key={step}
                  className={`flex items-start gap-3 text-sm ${
                    done || active ? 'text-paper' : 'text-white/35'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 ${
                      done
                        ? 'bg-gold border-gold text-navy-deep'
                        : active
                        ? 'border-gold text-gold'
                        : 'border-white/15'
                    }`}
                  >
                    {done ? <CheckCircle size={12} /> : <span className="font-mono text-[10px]">{i + 1}</span>}
                  </span>
                  <span className={active ? 'font-medium' : ''}>{step}</span>
                </li>
              )
            })}
          </ol>

          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Attempt · {attemptId.slice(0, 8)}
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'done' && finalScore !== null && finalCompletedAt) {
    return (
      <div className="fixed inset-0 exam-shell flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <CertificateCard
            variant="dark"
            showResultsLink
            resultsHref={`/student/results?attempt=${attemptId}`}
            data={{
              studentName,
              simulationTitle: simulation.title,
              roleType: simulation.role_type,
              companyName,
              score: finalScore,
              completedAt: finalCompletedAt,
              attemptId,
            }}
          />
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="fixed inset-0 exam-shell flex items-center justify-center z-50 px-4">
        <div className="exam-card max-w-md w-full text-center !pl-7">
          <AlertTriangle size={36} className="text-danger-soft mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-paper mb-2">Qiymətləndirmə uğursuz oldu</h2>
          <p className="text-sm text-white/55 mb-6">{analyzeError || 'Zəhmət olmasa bir daha cəhd edin.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setPhase('exam')
                setSubmitting(false)
              }}
              className="exam-btn-secondary"
            >
              Cavablara qayıt
            </button>
            <button onClick={handleSubmit} className="exam-btn-primary">
              Yenidən qiymətləndir
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 exam-shell flex items-center justify-center z-50 px-4">
        <div className="exam-card max-w-md w-full text-center !pl-7">
          <AlertTriangle size={36} className="text-gold mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-paper mb-2">Suallar tapılmadı</h2>
          <p className="text-sm text-white/55">Bu simulyasiyada sual yoxdur. HR ilə əlaqə saxlayın.</p>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="fixed inset-0 exam-shell overflow-auto">
      <ProctorCamera onCheatDetected={handleCheat} cheatCount={cheatCount} />

      {showCheatWarning && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-danger text-paper px-5 py-3 rounded-md flex items-center gap-2 shadow-xl border border-white/10"
        >
          <AlertTriangle size={16} aria-hidden="true" />
          <span className="text-sm font-semibold">
            Proctor xəbərdarlığı · {cheatCount}/3 — Ekrandan çıxmayın
          </span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0B1220]/92 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-28 sm:pr-40">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold font-semibold mb-1">
                Proctored assessment
              </p>
              <h1 className="font-display text-base sm:text-lg font-semibold text-paper truncate">
                {simulation.title}
              </h1>
              <p className="text-xs text-white/45 mt-0.5">
                {simulation.role_type}
                {companyName ? ` · ${companyName}` : ''}
                {' · '}
                <span className="font-mono">{answeredCount}/{questions.length}</span> cavablandı
              </p>
            </div>
            <div
              className={`flex items-center gap-2 font-mono font-bold text-lg tabular-nums shrink-0 ${
                timeLeft < 300 ? 'text-danger-soft animate-pulse' : 'text-gold'
              }`}
              aria-live="polite"
              aria-label={`${t('sim.timeLeft')} ${formatTime(timeLeft)}`}
            >
              <Clock size={16} aria-hidden="true" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="mt-3 h-1 bg-white/[0.06] rounded-sm overflow-hidden">
            <div
              className="h-full bg-gold rounded-sm transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <div className="exam-card mb-5 !pl-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-md bg-gold/15 border border-gold/30 text-gold font-mono font-bold text-sm flex items-center justify-center">
              {currentQ + 1}
            </span>
            <span className="text-[11px] text-white/45 uppercase tracking-[0.14em] font-semibold">
              {questionTypeLabel(q.type, t)}
            </span>
            <span className="ml-auto font-mono text-[10px] text-white/30 uppercase tracking-wider">
              Q{currentQ + 1}/{questions.length}
            </span>
          </div>
          <p className="text-paper font-medium text-base lg:text-lg leading-relaxed">
            {q.question || 'Sual mətni yoxdur'}
          </p>
        </div>

        <div className="exam-card !pl-6 mb-8">
          <QuestionAnswerInput
            question={q}
            value={answers[q.id] || ''}
            attemptId={attemptId}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQ((idx) => Math.max(0, idx - 1))}
            disabled={currentQ === 0}
            className="exam-btn-secondary"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            {t('sim.prev')}
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((idx) => Math.min(questions.length - 1, idx + 1))}
              className="exam-btn-primary"
            >
              {t('sim.next')}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="exam-btn-submit"
            >
              <CheckCircle size={16} aria-hidden="true" />
              {t('sim.submit')}
            </button>
          )}
        </div>

        <nav className="flex flex-wrap gap-2 mt-8 justify-center max-h-36 overflow-y-auto py-1" aria-label="Sual naviqasiyası">
          {questions.map((_, i) => {
            const answered = hasQuestionAnswer(answers, questions[i])
            const active = i === currentQ
            return (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-colors ${
                  active
                    ? 'bg-gold text-navy-deep'
                    : answered
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'bg-white/[0.04] text-white/40 border border-white/10 hover:border-white/20'
                }`}
                aria-current={active ? 'step' : undefined}
                aria-label={`Sual ${i + 1}${answered ? ', cavablanıb' : ''}`}
              >
                {i + 1}
              </button>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
