import type { Question } from '@/types'
import type { TFunction } from '@/i18n/translate'

export interface FileAnswerPayload {
  type: 'file'
  url: string
  path: string
  name: string
  mime: string
  size: number
}

export function parseFileAnswer(raw: string | undefined): FileAnswerPayload | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as FileAnswerPayload
    if (parsed?.type === 'file' && parsed.url) return parsed
  } catch {
    // not JSON
  }
  return null
}

export function hasQuestionAnswer(answers: Record<string, string>, q: Question): boolean {
  const raw = answers[q.id]
  if (!raw?.trim()) return false
  if (q.type === 'file_upload') {
    return Boolean(parseFileAnswer(raw))
  }
  return true
}

export function formatAnswerForAI(q: Question, raw: string | undefined, t?: TFunction): string {
  if (!raw?.trim()) return t ? t('sim.unanswered') : '(Cavab verilmədi)'

  if (q.type === 'file_upload') {
    const file = parseFileAnswer(raw)
    if (!file) return t ? t('sim.noFile') : '(Fayl yüklənməyib)'
    const sizeKb = Math.round(file.size / 1024)
    return t
      ? t('sim.fileUploaded', { name: file.name, mime: file.mime, size: sizeKb })
      : `[Fayl yükləndi: ${file.name} (${file.mime}, ${sizeKb} KB)]`
  }

  if (q.type === 'code') {
    const lang = q.code_language || 'code'
    const prefix = t ? t('sim.codeAnswer', { lang }) : `[${lang} kod cavabı]`
    return `${prefix}\n${raw}`
  }

  return raw
}

export function questionTypeLabel(type: Question['type'], t?: TFunction): string {
  if (t) {
    switch (type) {
      case 'multiple_choice': return t('sim.qMc')
      case 'code': return t('sim.qCode')
      case 'file_upload': return t('sim.qFile')
      default: return t('sim.qOpen')
    }
  }
  switch (type) {
    case 'multiple_choice': return 'Çox seçimli'
    case 'code': return 'Kod tapşırığı'
    case 'file_upload': return 'Fayl / Hesabat'
    default: return 'Açıq cavab'
  }
}

export const DEFAULT_FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.zip'
