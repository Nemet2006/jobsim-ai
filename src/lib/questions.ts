import type { Question, QuestionType } from '@/types'

type RawQuestion = Partial<Question> & {
  text?: string
  prompt?: string
}

const VALID_TYPES: QuestionType[] = ['open_ended', 'multiple_choice', 'code', 'file_upload']

function normalizeType(raw: unknown): QuestionType {
  if (typeof raw === 'string' && VALID_TYPES.includes(raw as QuestionType)) {
    return raw as QuestionType
  }
  return 'open_ended'
}

export function normalizeQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return []

  return raw.map((item, index) => {
    const q = item as RawQuestion
    const id = q.id || `q${index + 1}`
    const type = normalizeType(q.type)
    const question = (q.question || q.text || q.prompt || '').trim()

    return {
      id,
      type,
      question,
      options: type === 'multiple_choice' ? (q.options || []).filter(Boolean) : undefined,
      correct_option: q.correct_option,
      code_language: q.code_language,
      placeholder: q.placeholder,
      instructions: q.instructions,
      accepted_formats: q.accepted_formats,
    }
  })
}
