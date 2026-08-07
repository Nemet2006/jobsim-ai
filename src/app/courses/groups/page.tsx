export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Users, Plus, ClipboardList, ArrowRight, BookOpen } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/Motion'
import { GroupsClient } from '@/components/courses/GroupsClient'

export default async function CourseGroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch instructor's groups
  const { data: groups } = await supabase
    .from('course_groups')
    .select('*')
    .eq('instructor_id', user!.id)
    .order('created_at', { ascending: false })

  // For each group: member count + sim count
  const groupIds = (groups || []).map((g) => g.id)

  let memberCounts: Record<string, number> = {}
  let simCounts: Record<string, number> = {}

  if (groupIds.length > 0) {
    const [{ data: members }, { data: simAssigns }] = await Promise.all([
      supabase.from('group_members').select('group_id').in('group_id', groupIds),
      supabase.from('group_sim_assignments').select('group_id').in('group_id', groupIds),
    ])
    ;(members || []).forEach((m) => {
      memberCounts[m.group_id] = (memberCounts[m.group_id] || 0) + 1
    })
    ;(simAssigns || []).forEach((s) => {
      simCounts[s.group_id] = (simCounts[s.group_id] || 0) + 1
    })
  }

  const enrichedGroups = (groups || []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    join_code: (g as { join_code?: string | null }).join_code ?? null,
    created_at: g.created_at,
    memberCount: memberCounts[g.id] || 0,
    simCount: simCounts[g.id] || 0,
  }))

  return (
    <div>
      <EditorialHero
        eyebrow="Qrup İdarəsi"
        title={
          <>
            Siniflərinizi <span className="text-navy">qruplara</span> bölün.
          </>
        }
        dek={
          <>
            Hər qrupa fərqli HR şirkət simulyasiyaları verin. Bir müəllim, çoxlu qruplar,{' '}
            <strong className="text-ink">fərdi tərəqqi izlənməsi</strong>.
          </>
        }
        actions={<GroupCreateButton instructorId={user!.id} />}
        meta={[
          { label: 'Qruplar', value: `${enrichedGroups.length}` },
          { label: 'Ümumi tələbə', value: `${Object.values(memberCounts).reduce((a, b) => a + b, 0)}` },
          { label: 'Simulyasiyalar', value: `${Object.values(simCounts).reduce((a, b) => a + b, 0)}` },
        ]}
      />

      <GroupsClient
        groups={enrichedGroups}
        instructorId={user!.id}
      />
    </div>
  )
}

// Tiny server-renderable stub — real button is inside GroupsClient
function GroupCreateButton({ instructorId }: { instructorId: string }) {
  return (
    <div id="groups-create-trigger" data-instructor={instructorId}>
      {/* GroupsClient renders the actual button — this placeholder reserved for hero actions */}
    </div>
  )
}
