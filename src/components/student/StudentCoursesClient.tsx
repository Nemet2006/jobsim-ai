'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Hash, ClipboardList, Loader2, ArrowRight,
  X, CheckCircle2, LogOut, BookOpen, Sparkles, Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'

interface Group {
  id: string
  name: string
  description: string | null
  join_code: string | null
  joinedAt: string
  simCount: number
  instructor: { full_name: string } | null
}

interface Props {
  studentId: string
  groups: Group[]
}

export function StudentCoursesClient({ studentId, groups }: Props) {
  const [showJoin, setShowJoin] = useState(false)

  return (
    <div>
      <EditorialHero
        eyebrow="Kurslarım"
        title={
          <>
            Kursa <span className="italic font-light text-forest">qoşulun</span>,<br />
            tapşırıqları görün.
          </>
        }
        dek={
          <>
            Müəlliminiz sizə bir <strong className="text-ink">6 simvolluk kod</strong> verəcək.
            Həmin kodu daxil edin — qrupa qoşulun, müəllimin verdiyi HR simulyasiyaları dərhal
            görünəcək. Premium abunəliyiniz isə hər zaman aktivdir.
          </>
        }
        actions={
          <button onClick={() => setShowJoin(true)} className="btn-coral">
            <Hash size={15} aria-hidden="true" />
            Koda ilə qrupa qoşul
          </button>
        }
        meta={
          groups.length > 0
            ? [
                { label: 'Qruplar', value: `${groups.length}` },
                {
                  label: 'Simulyasiyalar',
                  value: `${groups.reduce((s, g) => s + g.simCount, 0)}`,
                },
              ]
            : undefined
        }
      />

      {groups.length === 0 ? (
        <EmptyState onJoinClick={() => setShowJoin(true)} />
      ) : (
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {groups.map((group) => (
            <StaggerItem key={group.id}>
              <GroupMemberCard group={group} studentId={studentId} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <AnimatePresence>
        {showJoin && (
          <JoinGroupModal studentId={studentId} onClose={() => setShowJoin(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Group member card ---------- */

function GroupMemberCard({ group, studentId }: { group: Group; studentId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [leaving, setLeaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function leaveGroup() {
    setLeaving(true)
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('student_id', studentId)
    setLeaving(false)
    setShowConfirm(false)
    startTransition(() => router.refresh())
  }

  return (
    <motion.article className="card p-6 group relative" whileHover={{ y: -2 }}>
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-forest text-cream font-display text-xl font-semibold flex items-center justify-center group-hover:scale-105 transition-transform">
          {group.name[0]?.toUpperCase()}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-8 h-8 rounded-full hover:bg-danger-tint flex items-center justify-center text-ink-mute hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`${group.name} qrupunu tərk et`}
        >
          <LogOut size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Instructor badge */}
      {group.instructor && (
        <p className="text-[10px] uppercase tracking-wider text-forest font-semibold mb-1">
          {group.instructor.full_name}
        </p>
      )}

      <h3 className="font-display text-xl font-semibold text-ink mb-1 leading-tight">
        {group.name}
      </h3>
      {group.description && (
        <p className="text-sm text-ink-mid line-clamp-2 mb-4">{group.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-forest/8">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-mid font-medium">
          <ClipboardList size={12} className="text-coral-deep" aria-hidden="true" />
          {group.simCount} simulyasiya
        </span>
        <Link
          href="/student/simulations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-deep"
        >
          Görüntülə
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {/* Leave confirm */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cream/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <LogOut size={24} className="text-danger mb-3" aria-hidden="true" />
            <p className="font-semibold text-ink mb-1">Qrupu tərk et?</p>
            <p className="text-xs text-ink-mid mb-5">
              Bu qrup müəlliminin verdiyi simulyasiyalar sizdən gizlənəcək.
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1 py-2 text-sm"
              >
                İmtina
              </button>
              <button
                onClick={leaveGroup}
                disabled={leaving}
                className="flex-1 py-2 text-sm font-medium rounded-full bg-danger text-white hover:bg-danger/90 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {leaving
                  ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  : <LogOut size={14} aria-hidden="true" />}
                Tərk et
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

/* ---------- Empty state ---------- */

function EmptyState({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <div className="card p-12 lg:p-16 text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-forest-wash flex items-center justify-center">
        <GraduationCap size={36} className="text-forest" aria-hidden="true" />
      </div>
      <h3 className="font-display text-3xl font-semibold mb-3">
        Heç bir kursunuz yoxdur
      </h3>
      <p className="text-ink-mid text-base mb-8 max-w-md mx-auto leading-relaxed">
        Müəlliminiz sizə 6 simvolluk bir <strong>qoşulma kodu</strong> verəcək.
        Həmin kodu daxil edərək qrupa qoşulun.
      </p>

      <button onClick={onJoinClick} className="btn-coral px-8 py-3.5 mb-10">
        <Hash size={15} aria-hidden="true" />
        Kod ilə qrupa qoşul
      </button>

      <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
        <div className="card-cream p-5">
          <Sparkles size={18} className="text-coral mb-3" aria-hidden="true" />
          <h4 className="font-semibold text-ink mb-1">Kurs tapşırıqları</h4>
          <p className="text-sm text-ink-mid leading-relaxed">
            Qrupa qoşulduqdan sonra müəllimin verdiyi HR simulyasiyaları avtomatik görünür.
          </p>
        </div>
        <div className="card-cream p-5">
          <BookOpen size={18} className="text-forest mb-3" aria-hidden="true" />
          <h4 className="font-semibold text-ink mb-1">Premium + Kurs birlikdə</h4>
          <p className="text-sm text-ink-mid leading-relaxed">
            Free/Premium abunəliyiniz ayrı davam edir. Kurs tapşırıqları əlavə olaraq gəlir.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Join Group Modal ---------- */

function JoinGroupModal({
  studentId,
  onClose,
}: {
  studentId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ groupName: string } | null>(null)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setError('Kod ən az 4 simvol olmalıdır')
      return
    }
    setLoading(true)
    setError(null)

    // Find group by join code (RPC bypasses RLS — no recursion, no broad table read)
    const { data: lookupRows, error: findErr } = await supabase.rpc(
      'lookup_group_by_join_code',
      { p_code: trimmed }
    )

    const group = lookupRows?.[0] as { id: string; name: string } | undefined

    if (findErr || !group) {
      setError('Belə bir kod tapılmadı. Müəlliminizlə yoxlayın.')
      setLoading(false)
      return
    }

    // Check already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      setError('Siz artıq bu qrupun üzvüsünüz.')
      setLoading(false)
      return
    }

    // Insert membership
    const { error: insertErr } = await supabase.from('group_members').insert({
      group_id: group.id,
      student_id: studentId,
    })

    if (insertErr) {
      setError('Xəta baş verdi: ' + insertErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess({ groupName: group.name })
    startTransition(() => router.refresh())
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
        onClick={!success ? onClose : undefined}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-group-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="card p-7 w-full max-w-sm pointer-events-auto">

          {/* Success */}
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-success text-white flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={28} aria-hidden="true" />
              </div>
              <span className="h-eyebrow block mb-2">Uğurlu!</span>
              <h2 className="font-display text-2xl font-semibold mb-2">
                Qrupa qoşuldunuz<span className="text-coral">.</span>
              </h2>
              <p className="text-sm text-ink-mid mb-6 leading-relaxed">
                <strong className="text-forest">{success.groupName}</strong> qrupuna qoşuldunuz.
                Müəllimin verdiyi simulyasiyalar artıq &ldquo;Simulyasiyalar&rdquo; səhifəsinizdə görünür.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/student/simulations"
                  onClick={onClose}
                  className="btn-coral w-full justify-center py-3"
                >
                  Simulyasiyalara keç
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <button onClick={onClose} className="btn-secondary w-full py-3">
                  Bağla
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="h-eyebrow block mb-1.5">Qrupa qoşul</span>
                  <h2 id="join-group-title" className="font-display text-2xl font-semibold">
                    Kod daxil edin<span className="text-coral">.</span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full hover:bg-forest-wash flex items-center justify-center text-ink-mid hover:text-forest"
                  aria-label="Bağla"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {error && (
                <div role="alert" aria-live="polite" className="mb-5 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label htmlFor="join-code" className="block text-sm font-semibold text-ink mb-2">
                    Qoşulma kodu
                  </label>
                  <input
                    id="join-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                    placeholder="məs. AB12CD"
                    maxLength={8}
                    required
                    autoFocus
                    autoComplete="off"
                    className="ed-input font-mono text-center text-2xl tracking-widest uppercase"
                    aria-describedby="join-code-hint"
                  />
                  <p id="join-code-hint" className="mt-2 text-xs text-ink-mute text-center">
                    Müəlliminiz bu kodu sizə verəcək
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
                    İmtina
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.trim().length < 4}
                    className="btn-coral flex-1 py-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Users size={15} aria-hidden="true" />
                    )}
                    Qoşul
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}
