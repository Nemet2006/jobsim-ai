export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { StudentCoursesClient } from '@/components/student/StudentCoursesClient'

export default async function StudentCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Groups this student belongs to
  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id, joined_at')
    .eq('student_id', user!.id)

  const groupIds = (memberRows || []).map((m) => m.group_id)

  let groups: {
    id: string
    name: string
    description: string | null
    join_code: string | null
    joinedAt: string
    simCount: number
    instructor: { full_name: string } | null
  }[] = []

  if (groupIds.length > 0) {
    const { data: groupData } = await supabase
      .from('course_groups')
      .select('id, name, description, join_code, instructor_id')
      .in('id', groupIds)

    const { data: simCounts } = await supabase
      .from('group_sim_assignments')
      .select('group_id')
      .in('group_id', groupIds)

    const countMap: Record<string, number> = {}
    ;(simCounts || []).forEach((s) => {
      countMap[s.group_id] = (countMap[s.group_id] || 0) + 1
    })

    const joinedAtMap: Record<string, string> = {}
    ;(memberRows || []).forEach((m) => {
      joinedAtMap[m.group_id] = m.joined_at
    })

    for (const g of groupData || []) {
      const { data: instructor } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', g.instructor_id)
        .single()

      groups.push({
        id: g.id,
        name: g.name,
        description: g.description,
        join_code: (g as { join_code?: string | null }).join_code ?? null,
        joinedAt: joinedAtMap[g.id] || '',
        simCount: countMap[g.id] || 0,
        instructor: instructor ? { full_name: instructor.full_name } : null,
      })
    }
  }

  return <StudentCoursesClient studentId={user!.id} groups={groups} />
}
