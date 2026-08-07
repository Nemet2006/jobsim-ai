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
import { AlertTriangle, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

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
  const cheatCountRef = useRef(0)

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

  // Countdown timer
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
  }, [attemptId, router, supabase])

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
  }, [answers, attemptId, questions, router, simulation, studentId, supabase, submitting])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((currentQ + 1) / questions.length) * 100
  const answeredCount = questions.filter((q) => hasQuestionAnswer(answers, q)).length

  if (phase === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-[#0F1B2A] flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-verdigris/20 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-4 border-verdigris border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mt-8 mb-2">AI cavabınızı analiz edir</h2>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-verdigris rounded-md animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div className="mt-6 max-w-xs text-center space-y-2">
          {['Cavablarınız oxunur...', 'Güclü tərəflər müəyyən edilir...', 'Hesabat hazırlanır...'].map((msg, i) => (
            <p key={i} className="text-sm text-slate-400 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>{msg}</p>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'done' && finalScore !== null && finalCompletedAt) {
    return (
      <div className="fixed inset-0 bg-[#0F1B2A] flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
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
      <div className="fixed inset-0 bg-[#0F1B2A] flex items-center justify-center z-50 px-4">
        <div className="exam-card max-w-md w-full text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">AI analizi uğursuz oldu</h2>
          <p className="text-sm text-slate-300 mb-6">{analyzeError || 'Zəhmət olmasa bir daha cəhd edin.'}</p>
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
              Yenidən analiz et
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0F1B2A] flex items-center justify-center z-50 px-4">
        <div className="exam-card max-w-md w-full text-center">
          <AlertTriangle size={40} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Suallar tapılmadı</h2>
          <p className="text-sm text-slate-300">Bu simulyasiyada sual yoxdur. HR ilə əlaqə saxlayın.</p>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="fixed inset-0 bg-[#0F1B2A] overflow-auto">
      <ProctorCamera onCheatDetected={handleCheat} cheatCount={cheatCount} />

      {/* Cheat Warning */}
      {showCheatWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <AlertTriangle size={18} />
          <span className="font-medium">Xəbərdarlıq! {cheatCount}/3 — Ekrandan çıxmayın!</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-[#1A2F48]/95 backdrop-blur border-b border-white/5 px-4 py-3 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-semibold text-white truncate">{simulation.title}</h1>
            <p className="text-xs text-slate-400">{answeredCount}/{questions.length} cavablandı</p>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-verdigris-soft'}`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1.5 bg-white/5 rounded-md overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-verdigris-deep to-verdigris-soft rounded-sm transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="exam-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-md bg-verdigris/20 border border-verdigris/30 text-verdigris-soft font-bold text-sm flex items-center justify-center">
              {currentQ + 1}
            </span>
            <span className="text-xs text-slate-300 uppercase tracking-wide">
              {questionTypeLabel(q.type)}
            </span>
          </div>
          <p className="text-white font-medium text-base lg:text-lg leading-relaxed">{q.question || 'Sual mətni yoxdur'}</p>
        </div>

        <QuestionAnswerInput
          question={q}
          value={answers[q.id] || ''}
          attemptId={attemptId}
          onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="exam-btn-secondary"
          >
            <ChevronLeft size={16} />
            Əvvəlki
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
              className="exam-btn-primary"
            >
              Növbəti
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="exam-btn-primary bg-green-600 hover:bg-green-500"
            >
              <CheckCircle size={16} />
              Simulyasiyanı Tamamla
            </button>
          )}
        </div>

        {/* Question indicators */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center max-h-36 overflow-y-auto py-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentQ
                  ? 'bg-verdigris text-white'
                  : hasQuestionAnswer(answers, questions[i])
                  ? 'bg-verdigris/20 text-verdigris-soft border border-verdigris/30'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
