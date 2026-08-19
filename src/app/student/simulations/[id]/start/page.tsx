import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SimulationExam from '@/components/simulation/SimulationExam'
import { trackServerEvent } from '@/lib/analytics'
import { getT } from '@/i18n/get-locale'
import { localizeOrTranslateSimulation } from '@/lib/ensure-sim-english'

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

  const { locale, t } = await getT()
  const localized = await localizeOrTranslateSimulation(sim, locale)

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
        title: localized.title,
        role_type: localized.role_type,
        duration_minutes: sim.duration_minutes,
        questions: localized.questions,
      }}
      attemptId={attempt.id}
      studentId={user!.id}
      studentName={profile?.full_name || user.email?.split('@')[0] || t('student.studentFallback')}
      companyName={
        (sim.creator as { company_name?: string | null } | null)?.company_name ?? null
      }
    />
  )
}
