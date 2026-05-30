import type { AIAnalyzeResponse } from '@/types'
import { chatJson } from '@/lib/openrouter'

const systemPrompt = `Sen JobSim AI platformasının ekspert qiymətləndiricisisən.
Sən iş simulyasiyası cavablarını analiz edərək namizədlərə ətraflı, konstruktiv rəy verirsən.
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

export function normalizeAnalysis(raw: Record<string, unknown>): AIAnalyzeResponse {
  const skills = (raw.skill_scores as Record<string, unknown>) || {}

  return {
    score: clampScore(raw.score),
    strengths: asStringArray(raw.strengths, ['Cavablarınız strukturlaşdırılıb']),
    weaknesses: asStringArray(raw.weaknesses, ['Bəzi suallarda daha detallı cavab verilə bilər']),
    advice: asStringArray(raw.advice, ['Real iş nümunələri ilə cavablarınızı zənginləşdirin']),
    detailed_feedback:
      typeof raw.detailed_feedback === 'string' && raw.detailed_feedback.trim()
        ? raw.detailed_feedback.trim().slice(0, 4000)
        : 'Cavablarınız ümumilikdə yaxşıdır. Daha konkret nümunələr və strukturlaşdırılmış yanaşma balınızı artıra bilər.',
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
}): Promise<{ ok: true; analysis: AIAnalyzeResponse } | { ok: false; error: string }> {
  if (!input.questions.length) {
    return { ok: false, error: 'Suallar göndərilməyib' }
  }

  const sanitizedPairs = input.questions.slice(0, 50).map((q, i) => ({
    question: String(q.question || '').slice(0, 2000),
    answer: String(q.answer || '').slice(0, 8000),
    index: i + 1,
  }))

  const userMessage = `
Simulyasiya: ${String(input.simulationTitle).slice(0, 200)}
Rol: ${String(input.roleType).slice(0, 100)}

Suallar və Cavablar:
${sanitizedPairs.map((q) => `${q.index}. Sual: ${q.question}\n   Cavab: ${q.answer}`).join('\n\n')}

Bu cavabları analiz et və JSON formatında nəticə ver.
  `.trim()

  const result = await chatJson({
    system: systemPrompt,
    user: userMessage,
    maxTokens: 1800,
    temperature: 0.6,
  })

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return {
    ok: true,
    analysis: normalizeAnalysis(result.data as Record<string, unknown>),
  }
}
