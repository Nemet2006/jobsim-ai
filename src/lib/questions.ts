import type { Question, QuestionType } from '@/types'

export const SIM_I18N_META_ID = '__jobsim_i18n__'

type RawQuestion = Partial<Question> & {
  text?: string
  prompt?: string
  title_en?: string
  description_en?: string
  role_type_en?: string
}

const VALID_TYPES: QuestionType[] = ['open_ended', 'multiple_choice', 'code', 'file_upload']

function normalizeType(raw: unknown): QuestionType {
  if (typeof raw === 'string' && VALID_TYPES.includes(raw as QuestionType)) {
    return raw as QuestionType
  }
  return 'open_ended'
}

export function extractSimI18nMeta(raw: unknown): {
  title_en?: string
  description_en?: string
  role_type_en?: string
} | null {
  if (!Array.isArray(raw)) return null
  const meta = raw.find((item) => (item as RawQuestion)?.id === SIM_I18N_META_ID) as RawQuestion | undefined
  if (!meta) return null
  return {
    title_en: meta.title_en,
    description_en: meta.description_en,
    role_type_en: meta.role_type_en,
  }
}

export function normalizeQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((item) => (item as RawQuestion)?.id !== SIM_I18N_META_ID)
    .map((item, index) => {
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
        question_en: q.question_en,
        options_en: q.options_en,
        placeholder_en: q.placeholder_en,
        instructions_en: q.instructions_en,
      }
    })
}
