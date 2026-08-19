import { chatJson } from '@/lib/openrouter'
import { SIM_I18N_META_ID, normalizeQuestions } from '@/lib/questions'
import type { Question } from '@/types'

interface TranslateInput {
  title: string
  description: string
  role_type: string
  questions: Question[]
}

interface TranslateOutput {
  title: string
  description: string
  role_type: string
  questions: Array<{
    id: string
    question: string
    options?: string[]
    placeholder?: string
    instructions?: string
  }>
}

export async function translateSimulationToEnglish(
  input: TranslateInput,
): Promise<TranslateOutput | null> {
  const result = await chatJson({
    system: `You translate JobSim AI job-simulation content from Azerbaijani to professional English.
Keep company names, person names, currency amounts, acronyms, and technical terms.
Return JSON only:
{
  "title": string,
  "description": string,
  "role_type": string,
  "questions": [{ "id": string, "question": string, "options"?: string[], "placeholder"?: string, "instructions"?: string }]
}
The questions array must have the same ids and length as the input.`,
    user: JSON.stringify({
      title: input.title,
      description: input.description,
      role_type: input.role_type,
      questions: input.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        placeholder: q.placeholder,
        instructions: q.instructions,
      })),
    }),
    maxTokens: 3500,
    temperature: 0.2,
  })

  if (!result.ok || !result.data || typeof result.data !== 'object') return null
  const data = result.data as Partial<TranslateOutput>
  if (!data.title || !Array.isArray(data.questions)) return null
  return {
    title: String(data.title),
    description: String(data.description || input.description),
    role_type: String(data.role_type || input.role_type),
    questions: data.questions.map((q) => ({
      id: String(q.id),
      question: String(q.question || ''),
      options: Array.isArray(q.options) ? q.options.map(String) : undefined,
      placeholder: q.placeholder ? String(q.placeholder) : undefined,
      instructions: q.instructions ? String(q.instructions) : undefined,
    })),
  }
}

/** Merge EN strings into the stored questions JSON (including a meta record). */
export function mergeEnglishIntoQuestions(
  rawQuestions: unknown,
  en: TranslateOutput,
): unknown[] {
  const list = Array.isArray(rawQuestions) ? [...rawQuestions] : []
  const filtered = list.filter((item) => (item as { id?: string })?.id !== SIM_I18N_META_ID)
  const byId = new Map(en.questions.map((q) => [q.id, q]))

  const merged = filtered.map((item, index) => {
    const raw = item as Question & { id?: string }
    const id = raw.id || `q${index + 1}`
    const hit = byId.get(id)
    if (!hit) return item
    return {
      ...raw,
      question_en: hit.question,
      options_en: hit.options,
      placeholder_en: hit.placeholder,
      instructions_en: hit.instructions,
    }
  })

  return [
    {
      id: SIM_I18N_META_ID,
      type: 'open_ended',
      question: '',
      title_en: en.title,
      description_en: en.description,
      role_type_en: en.role_type,
    },
    ...merged,
  ]
}

export function questionsFromUnknown(raw: unknown): Question[] {
  return normalizeQuestions(raw)
}
