export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import CoursesStudentsClient from '@/components/hr/CoursesStudentsClient'

export default async function CoursesStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignments } = await supabase
    .from('course_assignments')
    .select('student_id, simulation_id')
    .eq('instructor_id', user!.id)

  const studentIds = [...new Set((assignments || []).map((a) => a.student_id))]
  const simIds = [...new Set((assignments || []).map((a) => a.simulation_id))]

  const attemptStats: Record<string, { completed: number; total: number; avg: number }> = {}

  if (studentIds.length > 0 && simIds.length > 0) {
    const { data: attempts } = await supabase
      .from('simulation_attempts')
      .select('student_id, score, status, simulation_id')
      .in('student_id', studentIds)
      .in('simulation_id', simIds)

    studentIds.forEach((sid) => {
      const sa = (attempts || []).filter((a) => a.student_id === sid)
      const completed = sa.filter((a) => a.status === 'completed')
      const total = new Set((assignments || []).filter((a) => a.student_id === sid).map((a) => a.simulation_id)).size
      attemptStats[sid] = {
        completed: completed.length,
        total,
        avg: completed.length ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length) : 0,
      }
    })
  }

  const students: { id: string; full_name: string; university: string | null; email: string; stats: { completed: number; total: number; avg: number } }[] = []

  for (const sid of studentIds) {
    const { data: studentData } = await supabase.from('users').select('full_name, university, email').eq('id', sid).single()
    students.push({
      id: sid,
      full_name: studentData?.full_name || 'Tələbə',
      university: studentData?.university || null,
      email: studentData?.email || '',
      stats: attemptStats[sid] || { completed: 0, total: 0, avg: 0 },
    })
  }

  return <CoursesStudentsClient students={students} />
}
