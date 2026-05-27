export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, ClipboardList, BarChart2 } from 'lucide-react'
import { GroupDetailClient } from '@/components/courses/GroupDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the group (owned by this instructor)
  const { data: group } = await supabase
    .from('course_groups')
    .select('*')
    .eq('id', id)
    .eq('instructor_id', user!.id)
    .single()

  if (!group) notFound()

  // Group members
  const { data: memberRows } = await supabase
    .from('group_members')
    .select('student_id, joined_at')
    .eq('group_id', id)

  const memberIds = (memberRows || []).map((m) => m.student_id)

  // Fetch member profiles
  let memberProfiles: { id: string; full_name: string; email: string; university: string | null }[] = []
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, university')
      .in('id', memberIds)
    memberProfiles = data || []
  }

  // Assigned simulations for this group
  const { data: simAssigns } = await supabase
    .from('group_sim_assignments')
    .select('*, simulation:simulations(id, title, role_type, difficulty, duration_minutes, creator:users!created_by(company_name))')
    .eq('group_id', id)
    .order('assigned_at', { ascending: false })

  // Attempt stats per member per sim
  const assignedSimIds = (simAssigns || []).map((s) => s.simulation_id)
  let attempts: { student_id: string; simulation_id: string; score: number | null; status: string }[] = []
  if (memberIds.length > 0 && assignedSimIds.length > 0) {
    const { data } = await supabase
      .from('simulation_attempts')
      .select('student_id, simulation_id, score, status')
      .in('student_id', memberIds)
      .in('simulation_id', assignedSimIds)
    attempts = data || []
  }

  // All published simulations (HR-created) for assignment picker
  const { data: allSims } = await supabase
    .from('simulations')
    .select('id, title, role_type, difficulty, duration_minutes, creator:users!created_by(company_name, full_name)')
    .eq('is_published', true)
    .order('title')

  // All students in system (for adding to group)
  const { data: allStudents } = await supabase
    .from('users')
    .select('id, full_name, email, university')
    .eq('role', 'student')
    .order('full_name')

  return (
    <div>
      {/* Back */}
      <Link
        href="/courses/groups"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-mid hover:text-forest transition-colors mb-8"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Bütün qruplar
      </Link>

      {/* Hero */}
      <header className="pb-8 mb-2 border-b border-forest/8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-3xl bg-forest text-cream font-display text-2xl font-semibold flex items-center justify-center shadow-soft-md">
            {group.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <span className="h-eyebrow block mb-1">Qrup</span>
            <h1 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight font-semibold text-balance">
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-2 text-base text-ink-mid max-w-xl leading-relaxed">{group.description}</p>
            )}
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm mt-6">
          {[
            { label: 'Tələbələr', value: `${memberProfiles.length}`, icon: <Users size={12} aria-hidden="true" /> },
            { label: 'Simulyasiyalar', value: `${simAssigns?.length || 0}`, icon: <ClipboardList size={12} aria-hidden="true" /> },
            { label: 'Yaradılıb', value: new Date(group.created_at).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' }), icon: null },
          ].map((m, i) => (
            <div key={m.label} className="flex items-center gap-3">
              {i > 0 && <span className="h-4 w-px bg-forest/15" aria-hidden="true" />}
              <div>
                <dt className="text-ink-mute text-xs uppercase tracking-wider font-medium mb-0.5 flex items-center gap-1">
                  {m.icon}
                  {m.label}
                </dt>
                <dd className="text-ink font-semibold">{m.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </header>

      <GroupDetailClient
        groupId={id}
        instructorId={user!.id}
        members={memberProfiles}
        simAssigns={(simAssigns || []).map((s) => ({
          id: s.id,
          simulation_id: s.simulation_id,
          deadline: s.deadline,
          assigned_at: s.assigned_at,
          simulation: s.simulation as {
            id: string
            title: string
            role_type: string
            difficulty: string
            duration_minutes: number
            creator: { company_name: string | null } | null
          } | null,
        }))}
        attempts={attempts}
        allSims={(allSims || []).map((s) => ({
          id: s.id,
          title: s.title,
          role_type: s.role_type,
          difficulty: s.difficulty,
          duration_minutes: s.duration_minutes,
          creator: s.creator as { company_name: string | null; full_name: string } | null,
        }))}
        allStudents={(allStudents || []).filter((s) => !memberIds.includes(s.id))}
        existingSimIds={new Set(assignedSimIds)}
      />
    </div>
  )
}
