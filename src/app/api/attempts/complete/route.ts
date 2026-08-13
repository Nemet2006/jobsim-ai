import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/premium'
import { ApiError, getClientIp, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { runAiAnalysis } from '@/lib/ai-analyze'
import { trackServerEvent } from '@/lib/analytics'
import { formatAnswerForAI, questionTypeLabel } from '@/lib/answers'
import { normalizeQuestions } from '@/lib/questions'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimited = await enforceRateLimit(`attempt-complete:${ip}`, 40, 900)
    if (rateLimited) return rateLimited

    const { supabase, user } = await requireRole('student')
    const body = await request.json().catch(() => ({}))
    const attemptId = body.attemptId as string | undefined
    const answers = body.answers as Record<string, string> | undefined

    if (!attemptId || !answers || typeof answers !== 'object') {
      throw new ApiError('attemptId və answers tələb olunur', 400)
    }

    const { data: attempt } = await supabase
      .from('simulation_attempts')
      .select('id, student_id, status, simulation_id, simulation:simulations(title, role_type, questions)')
      .eq('id', attemptId)
      .eq('student_id', user.id)
      .single()

    if (!attempt || attempt.status !== 'in_progress') {
      throw new ApiError('Attempt tapılmadı və ya artıq bağlanıb', 403)
    }

    const simulation = attempt.simulation as {
      title: string
      role_type: string
      questions: unknown
    } | null

    if (!simulation) {
      throw new ApiError('Simulyasiya tapılmadı', 404)
    }

    const questions = normalizeQuestions(simulation.questions)
    const questionAnswerPairs = questions.map((q) => ({
      question: `[${questionTypeLabel(q.type)}] ${q.question}`,
      answer: formatAnswerForAI(q, answers[q.id]),
    }))

    const aiResult = await runAiAnalysis({
      simulationTitle: simulation.title,
      roleType: simulation.role_type,
      questions: questionAnswerPairs,
    })

    if (!aiResult.ok) {
      return NextResponse.json({ error: aiResult.error }, { status: 502 })
    }

    const analysis = aiResult.analysis
    const completedAt = new Date().toISOString()
    const admin = createAdminClient()

    const { error: updateError } = await admin
      .from('simulation_attempts')
      .update({
        status: 'completed',
        score: analysis.score,
        ai_analysis: analysis as unknown as Json,
        answers,
        completed_at: completedAt,
      })
      .eq('id', attemptId)
      .eq('student_id', user.id)
      .eq('status', 'in_progress')

    if (updateError) {
      console.error('Attempt complete update failed:', updateError.message)
      throw new ApiError('Nəticə saxlanıla bilmədi', 500)
    }

    if (analysis.skill_scores) {
      const skillArray = Object.entries(analysis.skill_scores).map(([name, score]) => ({
        skill_name: name,
        score,
        level:
          score >= 80 ? 'Expert' :
          score >= 60 ? 'Advanced' :
          score >= 40 ? 'Intermediate' : 'Beginner',
      }))

      await admin
        .from('skill_passport')
        .upsert({
          student_id: user.id,
          skills: skillArray as unknown as Json,
          updated_at: completedAt,
        })
    }

    await trackServerEvent({
      eventName: 'simulation_completed',
      userId: user.id,
      role: 'student',
      eventId: `simulation_completed:${attemptId}`,
      properties: {
        simulation_id: attempt.simulation_id,
        attempt_id: attemptId,
        score: analysis.score,
      },
    })

    return NextResponse.json({
      ...analysis,
      completed_at: completedAt,
    })
  } catch (error) {
    return jsonError(error, 'Simulyasiya tamamlanmadı')
  }
}
