import type { Locale } from '@/i18n/config'
import { CATALOG_EN } from '@/i18n/catalog-en'
import { extractSimI18nMeta, normalizeQuestions } from '@/lib/questions'
import type { Question } from '@/types'

export interface LocalizableSim {
  title: string
  description: string
  role_type: string
  questions: unknown
  title_en?: string | null
  description_en?: string | null
  role_type_en?: string | null
}

export interface LocalizedSimContent {
  title: string
  description: string
  role_type: string
  questions: Question[]
}

function localizeQuestion(q: Question, catalogQ?: { question: string; options?: string[] }): Question {
  const question = q.question_en || catalogQ?.question || q.question
  const options = q.options_en || catalogQ?.options || q.options
  return {
    ...q,
    question,
    options,
    placeholder: q.placeholder_en || q.placeholder,
    instructions: q.instructions_en || q.instructions,
  }
}

export function localizeSimulation(sim: LocalizableSim, locale: Locale): LocalizedSimContent {
  const questions = normalizeQuestions(sim.questions)
  if (locale !== 'en') {
    return {
      title: sim.title,
      description: sim.description,
      role_type: sim.role_type,
      questions,
    }
  }

  const meta = extractSimI18nMeta(sim.questions)
  const catalog = CATALOG_EN[sim.title]
  return {
    title: sim.title_en || meta?.title_en || catalog?.title || sim.title,
    description: sim.description_en || meta?.description_en || catalog?.description || sim.description,
    role_type: sim.role_type_en || meta?.role_type_en || catalog?.role_type || sim.role_type,
    questions: questions.map((q) => localizeQuestion(q, catalog?.questions[q.id])),
  }
}

export function hasEnglishContent(sim: LocalizableSim): boolean {
  if (sim.title_en || extractSimI18nMeta(sim.questions)?.title_en) return true
  if (CATALOG_EN[sim.title]) return true
  const questions = normalizeQuestions(sim.questions)
  return questions.some((q) => Boolean(q.question_en))
}
