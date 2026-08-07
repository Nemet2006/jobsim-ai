'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import type { Question, Difficulty, QuestionType } from '@/types'
import { Plus, Trash2, GripVertical, ChevronLeft, ChevronRight, Eye, Code2, FileUp } from 'lucide-react'
import { questionTypeLabel } from '@/lib/answers'

const ROLE_TYPES = [
  'Junior HR', 'Data Analyst', 'Sales Assistant', 'Marketing Intern',
  'Customer Support', 'Project Coordinator', 'Software Developer', 'Product Manager',
]

interface CreateSimulationFormProps {
  hrId: string
}

export default function CreateSimulationForm({ hrId }: CreateSimulationFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [roleType, setRoleType] = useState(ROLE_TYPES[0])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(30)

  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), type: 'open_ended', question: '' },
  ])

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        question: '',
        options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
        code_language: type === 'code' ? 'JavaScript' : undefined,
        instructions: type === 'file_upload' ? 'Hesabatı PDF və ya DOCX formatında yükləyin.' : undefined,
      },
    ])
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function updateQuestion(id: string, field: string, value: string | string[]) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  function updateOption(qId: string, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q
        const opts = [...(q.options || [])]
        opts[optIdx] = value
        return { ...q, options: opts }
      })
    )
  }

  async function handleSave(publish: boolean) {
    if (questions.length < 3) {
      alert('Minimum 3 sual tələb olunur')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('simulations').insert({
      title,
      description,
      role_type: roleType,
      difficulty,
      duration_minutes: duration,
      questions: questions as unknown as import('@/types/database').Json,
      created_by: hrId,
      is_published: publish,
    })
    setSaving(false)
    if (!error) {
      track('hr_simulation_created', {
        question_count: questions.length,
        status: publish ? 'published' : 'draft',
      })
      router.push('/hr/simulations')
    } else alert('Xəta: ' + error.message)
  }

  const steps = ['Əsas Məlumatlar', 'Suallar', 'Nəzərdən Keç']

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                step === i + 1
                  ? 'bg-navy-wash border border-navy/30 text-navy'
                  : step > i + 1
                  ? 'text-navy/60'
                  : 'text-ink-mute'
              }`}
            >
              <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
                step > i + 1 ? 'bg-navy border-navy text-paper' : step === i + 1 ? 'border-navy text-navy' : 'border-navy/20 text-ink-mute'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-navy/10 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Basic Info */}
      {step === 1 && (
        <div className="card-dossier p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold text-ink">Əsas Məlumatlar</h2>
          <div>
            <label className="block text-sm text-ink-mute mb-1.5">Başlıq *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Junior HR Simulyasiyası" className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-sm text-ink-mute mb-1.5">Təsvir *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Simulyasiya haqqında qısa məlumat..." rows={4} className="input-dark w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-mute mb-1.5">Rol tipi</label>
              <select value={roleType} onChange={(e) => setRoleType(e.target.value)} className="input-dark w-full">
                {ROLE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink-mute mb-1.5">Çətinlik</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="input-dark w-full">
                <option value="easy">Asan</option>
                <option value="medium">Orta</option>
                <option value="hard">Çətin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink-mute mb-1.5">Müddət: {duration} dəqiqə</label>
            <input type="range" min={10} max={120} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-navy" />
            <div className="flex justify-between text-xs text-ink-mute mt-1">
              <span>10 dəq</span><span>120 dəq</span>
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!title || !description}
            className="btn-primary flex items-center gap-2 ml-auto"
          >
            Növbəti <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2 — Questions */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card-dossier p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-lg font-semibold text-ink">Tapşırıqlar ({questions.length} · min 3)</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => addQuestion('open_ended')} className="btn-secondary text-sm flex items-center gap-1.5">
                  <Plus size={14} /> Açıq
                </button>
                <button onClick={() => addQuestion('multiple_choice')} className="btn-secondary text-sm flex items-center gap-1.5">
                  <Plus size={14} /> Test
                </button>
                <button onClick={() => addQuestion('code')} className="btn-secondary text-sm flex items-center gap-1.5">
                  <Code2 size={14} /> Kod
                </button>
                <button onClick={() => addQuestion('file_upload')} className="btn-secondary text-sm flex items-center gap-1.5">
                  <FileUp size={14} /> Fayl
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-paper-deep border border-navy/8 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <GripVertical size={16} className="text-ink-mute cursor-grab" />
                      <span className="w-5 h-5 rounded-full bg-navy-wash text-navy text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded border text-navy border-navy/25 bg-navy-wash">
                          {questionTypeLabel(q.type)}
                        </span>
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(q.id)} className="text-ink-mute hover:text-danger transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="Sualınızı yazın..."
                        className="input-dark w-full"
                      />
                      {q.type === 'code' && (
                        <input
                          value={q.code_language || ''}
                          onChange={(e) => updateQuestion(q.id, 'code_language', e.target.value)}
                          placeholder="Dil (JavaScript, Python, SQL...)"
                          className="input-dark w-full text-sm"
                        />
                      )}
                      {q.type === 'file_upload' && (
                        <textarea
                          value={q.instructions || ''}
                          onChange={(e) => updateQuestion(q.id, 'instructions', e.target.value)}
                          placeholder="Fayl təlimatları (format, struktur...)"
                          rows={2}
                          className="input-dark w-full text-sm resize-none"
                        />
                      )}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {q.options?.map((opt, oi) => (
                            <input
                              key={oi}
                              value={opt}
                              onChange={(e) => updateOption(q.id, oi, e.target.value)}
                              placeholder={`Seçim ${String.fromCharCode(65 + oi)}`}
                              className="input-dark w-full text-sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Geri
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={questions.length < 3 || questions.some((q) => !q.question)}
              className="btn-primary flex items-center gap-2"
            >
              Nəzərdən keç <Eye size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card-dossier p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Nəzərdən Keç</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Başlıq:</span>
                <span className="text-ink">{title}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Rol:</span>
                <span className="text-ink">{roleType}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Çətinlik:</span>
                <span className="text-ink">{difficulty}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Müddət:</span>
                <span className="text-ink">{duration} dəqiqə</span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Suallar:</span>
                <span className="text-ink">{questions.length} sual</span>
              </div>
              <div className="flex gap-3">
                <span className="text-ink-mute w-28 flex-shrink-0">Təsvir:</span>
                <span className="text-ink">{description}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Geri
            </button>
            <div className="flex gap-3">
              <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary">
                Qaralama Saxla
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Yayımla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
