import type { AIAnalyzeResponse } from '@/types'
import { chatJson } from '@/lib/openrouter'
import type { Locale } from '@/i18n/config'

const systemPromptAz = `Sen JobSim AI platformasının ekspert qiymətləndiricisisən.
Sən iş simulyasiyası cavablarını analiz edərək namizədlərə ətraflı, konstruktiv rəy verirsən.
Bütün mətn sahələrini Azərbaycan dilində yaz.
Cavabını HƏMİŞƏ aşağıdakı JSON formatında ver, başqa heç nə yazma:
{
  "score": <0-100 arası tam ədəd>,
  "strengths": [<3-5 güclü tərəf, hər biri bir cümlə>],
  "weaknesses": [<2-4 zəif tərəf, hər biri bir cümlə>],
  "advice": [<3-5 konkret tövsiyə>],
  "detailed_feedback": "<2-3 paraqraflıq ətraflı analiz>",
  "skill_scores": {
    "communication": <0-100>,
    "problem_solving": <0-100>,
    "analytical_thinking": <0-100>,
    "structure": <0-100>,
    "creativity": <0-100>
  }
}`

const systemPromptEn = `You are JobSim AI's expert assessor.
Analyse job-simulation answers and give candidates detailed, constructive feedback.
Write every text field in professional English.
Always respond with this JSON only:
{
  "score": <integer 0-100>,
  "strengths": [<3-5 strengths, one sentence each>],
  "weaknesses": [<2-4 weaknesses, one sentence each>],
  "advice": [<3-5 concrete recommendations>],
  "detailed_feedback": "<2-3 paragraph detailed analysis>",
  "skill_scores": {
    "communication": <0-100>,
    "problem_solving": <0-100>,
    "analytical_thinking": <0-100>,
    "structure": <0-100>,
    "creativity": <0-100>
  }
}`

function clampScore(value: unknown): number {
  const num = Number(value)
  if (Number.isNaN(num)) return 50
  return Math.max(0, Math.min(100, Math.round(num)))
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  const items = value.map(String).map((s) => s.trim()).filter(Boolean)
  return items.length ? items.slice(0, 8) : fallback
}

export function normalizeAnalysis(
  raw: Record<string, unknown>,
  locale: Locale = 'az',
): AIAnalyzeResponse {
  const skills = (raw.skill_scores as Record<string, unknown>) || {}
  const fallbacks =
    locale === 'en'
      ? {
          strengths: ['Your answers are structured'],
          weaknesses: ['Some questions could be answered in more detail'],
          advice: ['Support your answers with real work examples'],
          detailed:
            'Your answers are generally solid. More concrete examples and a clearer structure would raise your score.',
        }
      : {
          strengths: ['Cavablarınız strukturlaşdırılıb'],
          weaknesses: ['Bəzi suallarda daha detallı cavab verilə bilər'],
          advice: ['Real iş nümunələri ilə cavablarınızı zənginləşdirin'],
          detailed:
            'Cavablarınız ümumilikdə yaxşıdır. Daha konkret nümunələr və strukturlaşdırılmış yanaşma balınızı artıra bilər.',
        }

  return {
    score: clampScore(raw.score),
    strengths: asStringArray(raw.strengths, fallbacks.strengths),
    weaknesses: asStringArray(raw.weaknesses, fallbacks.weaknesses),
    advice: asStringArray(raw.advice, fallbacks.advice),
    detailed_feedback:
      typeof raw.detailed_feedback === 'string' && raw.detailed_feedback.trim()
        ? raw.detailed_feedback.trim().slice(0, 4000)
        : fallbacks.detailed,
    skill_scores: {
      communication: clampScore(skills.communication),
      problem_solving: clampScore(skills.problem_solving),
      analytical_thinking: clampScore(skills.analytical_thinking),
      structure: clampScore(skills.structure),
      creativity: clampScore(skills.creativity),
    },
  }
}

export async function runAiAnalysis(input: {
  simulationTitle: string
  roleType: string
  questions: Array<{ question: string; answer: string }>
  locale?: Locale
}): Promise<{ ok: true; analysis: AIAnalyzeResponse } | { ok: false; error: string }> {
  const locale = input.locale === 'en' ? 'en' : 'az'
  if (!input.questions.length) {
    return { ok: false, error: locale === 'en' ? 'No questions were submitted' : 'Suallar göndərilməyib' }
  }

  const sanitizedPairs = input.questions.slice(0, 50).map((q, i) => ({
    question: String(q.question || '').slice(0, 2000),
    answer: String(q.answer || '').slice(0, 8000),
    index: i + 1,
  }))

  const userMessage =
    locale === 'en'
      ? `
Simulation: ${String(input.simulationTitle).slice(0, 200)}
Role: ${String(input.roleType).slice(0, 100)}

Questions and answers:
${sanitizedPairs.map((q) => `${q.index}. Question: ${q.question}\n   Answer: ${q.answer}`).join('\n\n')}

Analyse these answers and return JSON.
`.trim()
      : `
Simulyasiya: ${String(input.simulationTitle).slice(0, 200)}
Rol: ${String(input.roleType).slice(0, 100)}

Suallar və Cavablar:
${sanitizedPairs.map((q) => `${q.index}. Sual: ${q.question}\n   Cavab: ${q.answer}`).join('\n\n')}

Bu cavabları analiz et və JSON formatında nəticə ver.
`.trim()

  const result = await chatJson({
    system: locale === 'en' ? systemPromptEn : systemPromptAz,
    user: userMessage,
    maxTokens: 1800,
    temperature: 0.6,
  })

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return {
    ok: true,
    analysis: normalizeAnalysis(result.data as Record<string, unknown>, locale),
  }
}
