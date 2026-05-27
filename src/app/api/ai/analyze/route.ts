import type { AIAnalyzeRequest, AIAnalyzeResponse } from '@/types'
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
  return items.length ? items : fallback
}

function normalizeAnalysis(raw: Record<string, unknown>): AIAnalyzeResponse {
  const skills = (raw.skill_scores as Record<string, unknown>) || {}

  return {
    score: clampScore(raw.score),
    strengths: asStringArray(raw.strengths, ['Cavablarınız strukturlaşdırılıb']),
    weaknesses: asStringArray(raw.weaknesses, ['Bəzi suallarda daha detallı cavab verilə bilər']),
    advice: asStringArray(raw.advice, ['Real iş nümunələri ilə cavablarınızı zənginləşdirin']),
    detailed_feedback:
      typeof raw.detailed_feedback === 'string' && raw.detailed_feedback.trim()
        ? raw.detailed_feedback.trim()
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

export async function POST(req: Request) {
  try {
    const body: AIAnalyzeRequest = await req.json()
    const { simulationTitle, roleType, questions } = body

    if (!questions || questions.length === 0) {
      return Response.json({ error: 'Suallar göndərilməyib' }, { status: 400 })
    }

    const userMessage = `
Simulyasiya: ${simulationTitle}
Rol: ${roleType}

Suallar və Cavablar:
${questions.map((q, i) => `${i + 1}. Sual: ${q.question}\n   Cavab: ${q.answer}`).join('\n\n')}

Bu cavabları analiz et və JSON formatında nəticə ver.
    `.trim()

    const result = await chatJson({
      system: systemPrompt,
      user: userMessage,
      maxTokens: 1800,
      temperature: 0.6,
    })

    if (!result.ok) {
      console.error('OpenRouter analyze failed:', result.error)
      return Response.json({ error: result.error }, { status: 502 })
    }

    const analysis = normalizeAnalysis(result.data as Record<string, unknown>)
    return Response.json({ ...analysis, _model: result.model })
  } catch (error) {
    console.error('AI analyze error:', error)
    return Response.json({ error: 'Analiz zamanı xəta baş verdi' }, { status: 500 })
  }
}
