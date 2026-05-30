import { runAiAnalysis } from '@/lib/ai-analyze'
import { ApiError, getClientIp, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'

/** @deprecated Use /api/attempts/complete for scored submissions. Auth-gated analysis only. */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const rateLimited = await enforceRateLimit(`ai-analyze:${ip}`, 20, 3600)
    if (rateLimited) return rateLimited

    await requireRole('student')

    const body = await req.json()
    const { simulationTitle, roleType, questions } = body

    const result = await runAiAnalysis({
      simulationTitle,
      roleType,
      questions,
    })

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 })
    }

    return Response.json(result.analysis)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    console.error('AI analyze error:', error)
    return jsonError(error, 'Analiz zamanı xəta baş verdi')
  }
}
