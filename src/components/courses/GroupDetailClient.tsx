'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Users, ClipboardList, BarChart2, Search, Clock, Loader2,
  Trash2, CheckCircle2, ArrowUpRight, UserPlus, Layers,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { getDifficultyLabel, getScoreColor } from '@/lib/utils'
import type { Difficulty } from '@/types'

/* ---------- Types ---------- */

interface Member {
  id: string
  full_name: string
  email: string
  university: string | null
}

interface SimAssign {
  id: string
  simulation_id: string
  deadline: string | null
  assigned_at: string
  simulation: {
    id: string
    title: string
    role_type: string
    difficulty: string
    duration_minutes: number
    creator: { company_name: string | null } | null
  } | null
}

interface Attempt {
  student_id: string
  simulation_id: string
  score: number | null
  status: string
}

interface AvailableSim {
  id: string
  title: string
  role_type: string
  difficulty: string
  duration_minutes: number
  creator: { company_name: string | null; full_name: string } | null
}

interface AvailableStudent {
  id: string
  full_name: string
  email: string
  university: string | null
}

interface GroupDetailClientProps {
  groupId: string
  instructorId: string
  members: Member[]
  simAssigns: SimAssign[]
  attempts: Attempt[]
  allSims: AvailableSim[]
  allStudents: AvailableStudent[]
  existingSimIds: Set<string>
}

/* ---------- Main ---------- */

export function GroupDetailClient({
  groupId,
  instructorId,
  members,
  simAssigns,
  attempts,
  allSims,
  allStudents,
  existingSimIds,
}: GroupDetailClientProps) {
  const [showAddStudents, setShowAddStudents] = useState(false)
  const [showAssignSim, setShowAssignSim] = useState(false)

  // Stats per member
  function memberStats(memberId: string) {
    const ma = attempts.filter((a) => a.student_id === memberId)
    const completed = ma.filter((a) => a.status === 'completed')
    const avg = completed.length
      ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
      : null
    return { completed: completed.length, total: simAssigns.length, avg }
  }

  const tabs: TabItem[] = [
    {
      id: 'members',
      label: 'Tələbələr',
      count: members.length,
      icon: <Users size={14} aria-hidden="true" />,
      content: (
        <MembersTab
          members={members}
          simAssigns={simAssigns}
          memberStats={memberStats}
          groupId={groupId}
          onAddClick={() => setShowAddStudents(true)}
        />
      ),
    },
    {
      id: 'simulations',
      label: 'Simulyasiyalar',
      count: simAssigns.length,
      icon: <ClipboardList size={14} aria-hidden="true" />,
      content: (
        <SimulationsTab
          simAssigns={simAssigns}
          members={members}
          attempts={attempts}
          groupId={groupId}
          onAssignClick={() => setShowAssignSim(true)}
        />
      ),
    },
    {
      id: 'progress',
      label: 'Tərəqqi',
      icon: <BarChart2 size={14} aria-hidden="true" />,
      content: (
        <ProgressTab
          members={members}
          simAssigns={simAssigns}
          attempts={attempts}
        />
      ),
    },
  ]

  return (
    <div>
      <Tabs items={tabs} sticky />

      {/* Add students modal */}
      <AnimatePresence>
        {showAddStudents && (
          <AddStudentsModal
            groupId={groupId}
            allStudents={allStudents}
            onClose={() => setShowAddStudents(false)}
          />
        )}
      </AnimatePresence>

      {/* Assign simulation modal */}
      <AnimatePresence>
        {showAssignSim && (
          <AssignSimModal
            groupId={groupId}
            instructorId={instructorId}
            allSims={allSims}
            existingSimIds={existingSimIds}
            onClose={() => setShowAssignSim(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Members Tab ---------- */

function MembersTab({
  members,
  simAssigns,
  memberStats,
  groupId,
  onAddClick,
}: {
  members: Member[]
  simAssigns: SimAssign[]
  memberStats: (id: string) => { completed: number; total: number; avg: number | null }
  groupId: string
  onAddClick: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [removing, setRemoving] = useState<string | null>(null)

  async function removeMember(studentId: string) {
    setRemoving(studentId)
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('student_id', studentId)
    setRemoving(null)
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="h-eyebrow block mb-1">Qrup üzvləri</span>
          <h2 className="font-display text-2xl font-semibold">
            {members.length} tələbə<span className="text-gold">.</span>
          </h2>
        </div>
        <button onClick={onAddClick} className="btn-primary">
          <UserPlus size={15} aria-hidden="true" />
          Tələbə əlavə et
        </button>
      </div>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((m, idx) => {
            const stats = memberStats(m.id)
            const progress = simAssigns.length > 0
              ? Math.round((stats.completed / simAssigns.length) * 100)
              : 0

            return (
              <motion.article
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="card p-5 flex items-center gap-4 group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-navy text-paper font-display text-lg font-semibold flex items-center justify-center shrink-0">
                  {m.full_name[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-semibold text-ink truncate">{m.full_name}</p>
                  <p className="text-xs text-ink-mute truncate">{m.email}</p>
                  {m.university && <p className="text-xs text-navy font-medium truncate">{m.university}</p>}
                </div>

                {/* Progress */}
                {simAssigns.length > 0 && (
                  <div className="hidden sm:block shrink-0 text-right">
                    <p className="text-xs text-ink-mute uppercase tracking-wider font-semibold mb-1">
                      {stats.completed}/{simAssigns.length} tamamlandı
                    </p>
                    <div className="w-28 h-1.5 bg-navy/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                )}

                {/* Score */}
                {stats.avg !== null && (
                  <div className="shrink-0 text-right">
                    <p className={`font-display text-3xl font-semibold ${getScoreColor(stats.avg)}`}>
                      {stats.avg}
                    </p>
                    <p className="text-[10px] text-ink-mute uppercase tracking-wider font-semibold">/ 100</p>
                  </div>
                )}

                {/* Remove */}
                <button
                  onClick={() => removeMember(m.id)}
                  disabled={removing === m.id}
                  className="shrink-0 w-9 h-9 rounded-full hover:bg-danger-tint flex items-center justify-center text-ink-mute hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`${m.full_name}-ı qrupdan çıxar`}
                >
                  {removing === m.id
                    ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    : <Trash2 size={14} aria-hidden="true" />}
                </button>
              </motion.article>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-wash flex items-center justify-center">
            <Users size={28} className="text-navy" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Bu qrupda tələbə yoxdur</h3>
          <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
            Sistemdəki tələbələri axtarıb bu qrupa daxil edin.
          </p>
          <button onClick={onAddClick} className="btn-primary inline-flex">
            <UserPlus size={14} aria-hidden="true" />
            İlk tələbəni əlavə et
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Simulations Tab ---------- */

function SimulationsTab({
  simAssigns,
  members,
  attempts,
  groupId,
  onAssignClick,
}: {
  simAssigns: SimAssign[]
  members: Member[]
  attempts: Attempt[]
  groupId: string
  onAssignClick: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [removing, setRemoving] = useState<string | null>(null)

  async function removeSimAssign(assignId: string) {
    setRemoving(assignId)
    await supabase.from('group_sim_assignments').delete().eq('id', assignId)
    setRemoving(null)
    startTransition(() => router.refresh())
  }

  function simStats(simId: string) {
    const sa = attempts.filter((a) => a.simulation_id === simId)
    const completed = sa.filter((a) => a.status === 'completed')
    const avg = completed.length
      ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
      : null
    return { completed: completed.length, total: members.length, avg }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="h-eyebrow block mb-1">Bu qrupa verilmiş</span>
          <h2 className="font-display text-2xl font-semibold">
            {simAssigns.length} simulyasiya<span className="text-gold">.</span>
          </h2>
        </div>
        <button onClick={onAssignClick} className="btn-primary">
          <Plus size={15} aria-hidden="true" />
          Simulyasiya ver
        </button>
      </div>

      {simAssigns.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {simAssigns.map((sa, idx) => {
            const sim = sa.simulation
            const stats = simStats(sa.simulation_id)
            const progress = members.length > 0
              ? Math.round((stats.completed / members.length) * 100)
              : 0
            const diff = (sim?.difficulty || 'easy') as Difficulty

            return (
              <motion.article
                key={sa.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-navy text-paper font-display font-semibold text-base flex items-center justify-center shrink-0">
                      {(sim?.creator?.company_name || sim?.title || 'J')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      {sim?.creator?.company_name && (
                        <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                          {sim.creator.company_name}
                        </p>
                      )}
                      <h3 className="font-display text-base font-semibold text-ink leading-tight line-clamp-1">
                        {sim?.title || 'Simulyasiya'}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSimAssign(sa.id)}
                    disabled={removing === sa.id}
                    className="shrink-0 w-8 h-8 rounded-full hover:bg-danger-tint flex items-center justify-center text-ink-mute hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Simulyasiyanı qrupdan çıxar"
                  >
                    {removing === sa.id
                      ? <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                      : <Trash2 size={12} aria-hidden="true" />}
                  </button>
                </div>

                {/* Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="tag-neutral text-[10px]">{sim?.role_type}</span>
                  <span className={`text-[10px] ${
                    diff === 'easy' ? 'pill-difficulty-intro' :
                    diff === 'medium' ? 'pill-difficulty-inter' : 'pill-difficulty-adv'
                  }`}>{getDifficultyLabel(diff)}</span>
                  {sim?.duration_minutes && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink-mute font-medium">
                      <Clock size={9} aria-hidden="true" />
                      {sim.duration_minutes} dəq
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="border-t border-navy/8 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-ink-mute font-medium">
                      {stats.completed}/{members.length} tamamladı
                    </p>
                    {stats.avg !== null && (
                      <p className={`text-sm font-semibold ${getScoreColor(stats.avg)}`}>
                        ort. {stats.avg}
                      </p>
                    )}
                  </div>
                  <div className="h-1.5 bg-navy/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                {sa.deadline && (
                  <p className="mt-2 text-[10px] text-ink-mute uppercase tracking-wider font-semibold">
                    Son tarix: {new Date(sa.deadline).toLocaleDateString('az-AZ')}
                  </p>
                )}
              </motion.article>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-wash flex items-center justify-center">
            <ClipboardList size={28} className="text-gold-deep" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Heç bir simulyasiya yoxdur</h3>
          <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
            HR şirkətlərinin simulyasiyalarından seçin, bu qrupa verin.
          </p>
          <button onClick={onAssignClick} className="btn-primary inline-flex">
            <Plus size={14} aria-hidden="true" />
            Simulyasiya ver
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Progress Tab ---------- */

function ProgressTab({
  members,
  simAssigns,
  attempts,
}: {
  members: Member[]
  simAssigns: SimAssign[]
  attempts: Attempt[]
}) {
  if (members.length === 0 || simAssigns.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BarChart2 size={32} className="text-navy mx-auto mb-4" aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold mb-2">Hələ məlumat yoxdur</h3>
        <p className="text-ink-mid text-sm max-w-sm mx-auto">
          Tələbə və simulyasiya əlavə edildikdən sonra tərəqqi burada görünəcək.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <span className="h-eyebrow block mb-1">Matrix görünüşü</span>
        <h2 className="font-display text-2xl font-semibold">
          Kim, hansı simulyasiyanı tamamladı?
        </h2>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[600px]" aria-label="Tərəqqi matrisi">
          <thead>
            <tr className="border-b border-navy/8">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-ink-mute font-semibold w-[180px]">
                Tələbə
              </th>
              {simAssigns.map((sa) => (
                <th
                  key={sa.id}
                  className="p-4 text-xs uppercase tracking-wider text-ink-mute font-semibold text-center min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="truncate max-w-[100px] block text-ink font-semibold normal-case text-[11px] leading-tight">
                      {sa.simulation?.title || 'Sim'}
                    </span>
                    {sa.simulation?.creator?.company_name && (
                      <span className="text-[9px] text-ink-mute truncate max-w-[100px]">
                        {sa.simulation.creator.company_name}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-4 text-xs uppercase tracking-wider text-ink-mute font-semibold text-center">
                Orta
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const memberAttempts = attempts.filter((a) => a.student_id === member.id)
              const completed = memberAttempts.filter((a) => a.status === 'completed')
              const avg = completed.length
                ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
                : null

              return (
                <tr key={member.id} className="border-b border-navy/8 hover:bg-navy-wash/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy text-paper font-display text-sm font-semibold flex items-center justify-center shrink-0">
                        {member.full_name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{member.full_name}</p>
                      </div>
                    </div>
                  </td>
                  {simAssigns.map((sa) => {
                    const attempt = memberAttempts.find(
                      (a) => a.simulation_id === sa.simulation_id && a.status === 'completed'
                    )
                    const inProgress = memberAttempts.find(
                      (a) => a.simulation_id === sa.simulation_id && a.status === 'in_progress'
                    )
                    return (
                      <td key={sa.id} className="p-4 text-center">
                        {attempt ? (
                          <div>
                            <span className={`font-display text-xl font-semibold ${getScoreColor(attempt.score || 0)}`}>
                              {attempt.score}
                            </span>
                            <p className="text-[9px] text-ink-mute font-semibold">/ 100</p>
                          </div>
                        ) : inProgress ? (
                          <span className="tag-gold text-[10px]">Davam edir</span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-paper-deep border border-navy/10 inline-flex items-center justify-center" aria-label="Başlanmayıb">
                            <span className="w-2 h-2 rounded-full bg-ink-mute/30" aria-hidden="true" />
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="p-4 text-center">
                    {avg !== null ? (
                      <span className={`font-display text-xl font-semibold ${getScoreColor(avg)}`}>{avg}</span>
                    ) : (
                      <span className="text-xs text-ink-mute">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Add Students Modal ---------- */

function AddStudentsModal({
  groupId,
  allStudents,
  onClose,
}: {
  groupId: string
  allStudents: AvailableStudent[]
  onClose: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const filtered = allStudents.filter((s) => {
    const q = search.toLowerCase()
    return !q || `${s.full_name} ${s.email} ${s.university || ''}`.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAdd() {
    if (selected.size === 0) return
    setLoading(true)
    await supabase.from('group_members').insert(
      Array.from(selected).map((studentId) => ({ group_id: groupId, student_id: studentId }))
    )
    setLoading(false)
    onClose()
    startTransition(() => router.refresh())
  }

  return (
    <ModalShell
      title="Tələbə əlavə et"
      eyebrow="Qrup üzvlüyü"
      onClose={onClose}
    >
      {allStudents.length === 0 ? (
        <div className="py-8 text-center">
          <Users size={32} className="text-navy mx-auto mb-3" aria-hidden="true" />
          <p className="text-ink-mid text-sm">Bütün tələbələr artıq bu qrupdadır</p>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tələbə axtar…"
              className="ed-input pl-9 py-2.5 text-sm"
              aria-label="Tələbə axtar"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 mb-5 -mx-1 px-1">
            {filtered.length === 0 ? (
              <p className="text-center text-ink-mute text-sm py-6">Heç bir nəticə yoxdur</p>
            ) : filtered.map((s) => {
              const isSelected = selected.has(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-navy bg-navy-wash'
                      : 'border-transparent bg-paper hover:border-navy/20'
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm ${
                    isSelected ? 'bg-navy text-paper' : 'bg-navy-wash text-navy'
                  }`}>
                    {s.full_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{s.full_name}</p>
                    {s.university && <p className="text-xs text-ink-mute truncate">{s.university}</p>}
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-navy shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 py-3">İmtina</button>
            <button
              onClick={handleAdd}
              disabled={loading || selected.size === 0}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <UserPlus size={15} aria-hidden="true" />}
              {selected.size > 0 ? `${selected.size} tələbə əlavə et` : 'Seçin'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ---------- Assign Sim Modal ---------- */

function AssignSimModal({
  groupId,
  instructorId,
  allSims,
  existingSimIds,
  onClose,
}: {
  groupId: string
  instructorId: string
  allSims: AvailableSim[]
  existingSimIds: Set<string>
  onClose: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [selectedSims, setSelectedSims] = useState<Set<string>>(new Set())
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const available = allSims.filter((s) => !existingSimIds.has(s.id))
  const filtered = available.filter((s) => {
    const q = search.toLowerCase()
    return !q || `${s.title} ${s.role_type} ${s.creator?.company_name || ''}`.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setSelectedSims((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAssign() {
    if (selectedSims.size === 0) return
    setLoading(true)

    const rows = Array.from(selectedSims).map((simId) => ({
      group_id: groupId,
      instructor_id: instructorId,
      simulation_id: simId,
      deadline: deadline || null,
    }))

    await supabase.from('group_sim_assignments').insert(rows)
    setLoading(false)
    onClose()
    startTransition(() => router.refresh())
  }

  return (
    <ModalShell
      title="Simulyasiya ver"
      eyebrow="HR şirkət simulyasiyaları"
      onClose={onClose}
      wide
    >
      {available.length === 0 ? (
        <div className="py-8 text-center">
          <ClipboardList size={32} className="text-navy mx-auto mb-3" aria-hidden="true" />
          <p className="text-ink-mid text-sm">Bütün mövcud simulyasiyalar artıq bu qrupa verilib</p>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Şirkət, rol, ad…"
              className="ed-input pl-9 py-2.5 text-sm"
              aria-label="Simulyasiya axtar"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 mb-5 -mx-1 px-1">
            {filtered.length === 0 ? (
              <p className="text-center text-ink-mute text-sm py-6">Heç bir nəticə yoxdur</p>
            ) : filtered.map((sim) => {
              const isSelected = selectedSims.has(sim.id)
              const diff = sim.difficulty as Difficulty
              return (
                <button
                  key={sim.id}
                  onClick={() => toggle(sim.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-navy bg-navy-wash'
                      : 'border-transparent bg-paper hover:border-navy/20'
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-base ${
                    isSelected ? 'bg-navy text-paper' : 'bg-navy-wash text-navy'
                  }`}>
                    {(sim.creator?.company_name || sim.title)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-ink truncate">{sim.title}</p>
                      {sim.creator?.company_name && (
                        <span className="text-[10px] text-ink-mute font-medium shrink-0">
                          · {sim.creator.company_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tag-neutral text-[10px] py-0">{sim.role_type}</span>
                      <span className={`text-[10px] ${
                        diff === 'easy' ? 'pill-difficulty-intro' :
                        diff === 'medium' ? 'pill-difficulty-inter' : 'pill-difficulty-adv'
                      }`}>{getDifficultyLabel(diff)}</span>
                      <span className="text-[10px] text-ink-mute font-medium flex items-center gap-1">
                        <Clock size={9} aria-hidden="true" />{sim.duration_minutes} dəq
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-navy shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mb-5">
            <label htmlFor="deadline" className="block text-sm font-semibold text-ink mb-2">
              Son tarix <span className="text-ink-mute font-normal">· Opsional</span>
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="ed-input"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 py-3">İmtina</button>
            <button
              onClick={handleAssign}
              disabled={loading || selectedSims.size === 0}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <Layers size={15} aria-hidden="true" />}
              {selectedSims.size > 0 ? `${selectedSims.size} sim ver` : 'Seçin'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ---------- Modal Shell ---------- */

function ModalShell({
  title,
  eyebrow,
  children,
  onClose,
  wide,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className={`card p-7 w-full pointer-events-auto ${wide ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="h-eyebrow block mb-1.5">{eyebrow}</span>
              <h2 className="font-display text-2xl font-semibold">
                {title}<span className="text-gold">.</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-navy-wash flex items-center justify-center text-ink-mid hover:text-navy"
              aria-label="Bağla"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </>
  )
}
