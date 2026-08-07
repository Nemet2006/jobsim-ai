import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SimulationExam from '@/components/simulation/SimulationExam'
import { trackServerEvent } from '@/lib/analytics'
import { canStudentAccessSimulation } from '@/lib/simulation-access'
import { normalizeQuestions } from '@/lib/questions'
import type { Question } from '@/types'

export default async function SimulationStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: sim }, { data: profile }] = await Promise.all([
    supabase
      .from('simulations')
      .select('*, creator:users!created_by(company_name)')
      .eq('id', id)
      .eq('is_published', true)
      .single(),
    supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single(),
  ])

  if (!sim) notFound()

  const access = await canStudentAccessSimulation(supabase, user.id, id)
  if (!access.allowed) {
    redirect('/student/premium?locked=1')
  }

  // Create attempt record
  const { data: attempt } = await supabase
    .from('simulation_attempts')
    .insert({
      simulation_id: id,
      student_id: user!.id,
      status: 'in_progress',
      answers: {},
    })
    .select()
    .single()

  if (!attempt) notFound()

  await trackServerEvent({
    eventName: 'simulation_started',
    userId: user.id,
    role: 'student',
    eventId: `simulation_started:${attempt.id}`,
    pagePath: `/student/simulations/${id}/start`,
    properties: { simulation_id: id, attempt_id: attempt.id },
  })

  return (
    <SimulationExam
      simulation={{
        id: sim.id,
        title: sim.title,
        role_type: sim.role_type,
        duration_minutes: sim.duration_minutes,
        questions: normalizeQuestions(sim.questions) as Question[],
      }}
      attemptId={attempt.id}
      studentId={user!.id}
      studentName={profile?.full_name || user.email?.split('@')[0] || 'Tələbə'}
      companyName={
        (sim.creator as { company_name?: string | null } | null)?.company_name ?? null
      }
    />
  )
}
