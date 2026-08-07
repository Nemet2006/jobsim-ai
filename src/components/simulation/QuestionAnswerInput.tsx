'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, Loader2, X, Code2 } from 'lucide-react'
import type { Question } from '@/types'
import { parseFileAnswer, DEFAULT_FILE_ACCEPT } from '@/lib/answers'

interface QuestionAnswerInputProps {
  question: Question
  value: string
  attemptId: string
  onChange: (value: string) => void
}

export function QuestionAnswerInput({ question, value, attemptId, onChange }: QuestionAnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileAnswer = question.type === 'file_upload' ? parseFileAnswer(value) : null
  const accept = question.accepted_formats || DEFAULT_FILE_ACCEPT

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('attemptId', attemptId)
      fd.append('questionId', question.id)
      const res = await fetch('/api/attempts/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error || 'Yükləmə uğursuz')
        return
      }
      onChange(JSON.stringify(data))
    } catch {
      setUploadError('Şəbəkə xətası')
    } finally {
      setUploading(false)
    }
  }

  if (question.type === 'code') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.14em] text-white/45 font-semibold">
          <Code2 size={13} aria-hidden="true" />
          <span>{question.code_language || 'JavaScript'} · Kod cavabı</span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || '// Kodunuzu buraya yazın...'}
          rows={14}
          spellCheck={false}
          className="exam-input text-sm leading-relaxed font-mono text-[#D4E0C8] placeholder:text-white/25"
        />
      </div>
    )
  }

  if (question.type === 'file_upload') {
    return (
      <div className="space-y-3">
        {question.instructions && (
          <p className="text-sm text-white/70 bg-white/[0.03] border border-white/10 rounded-md p-4 leading-relaxed">
            {question.instructions}
          </p>
        )}
        <p className="text-xs text-white/40">
          Dəstək: PDF, DOCX, XLSX, PPTX, TXT, CSV, PNG, JPG, ZIP · max 10MB
        </p>

        {fileAnswer ? (
          <div className="flex items-center gap-3 p-4 rounded-md border border-gold/35 bg-gold/10">
            <FileText size={22} className="text-gold-soft shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-paper truncate">{fileAnswer.name}</p>
              <p className="text-xs text-white/45">{Math.round(fileAnswer.size / 1024)} KB · yükləndi</p>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-md hover:bg-white/10 text-white/45 hover:text-paper"
              aria-label="Faylı sil"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-md border border-dashed border-white/20 hover:border-gold/45 hover:bg-white/[0.03] transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-gold" aria-hidden="true" />
            ) : (
              <Upload className="w-8 h-8 text-white/40" aria-hidden="true" />
            )}
            <span className="text-sm font-medium text-paper">
              {uploading ? 'Yüklənir…' : 'Hesabat / fayl yüklə'}
            </span>
            <span className="text-xs text-white/40">Klikləyin və seçin</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />

        {uploadError && (
          <p role="alert" className="text-sm text-danger-soft">{uploadError}</p>
        )}
      </div>
    )
  }

  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-2.5">
        {question.options?.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-full text-left p-4 rounded-md border transition-colors ${
              value === opt
                ? 'border-gold/45 bg-gold/10 text-paper'
                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <span className={`inline-flex w-6 h-6 rounded-md border mr-3 items-center justify-center text-xs font-bold font-mono ${
              value === opt ? 'border-gold bg-gold text-navy-deep' : 'border-white/20 text-white/45'
            }`}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    )
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder || 'Cavabınızı buraya yazın...'}
      rows={8}
      className="exam-input text-sm leading-relaxed"
    />
  )
}
