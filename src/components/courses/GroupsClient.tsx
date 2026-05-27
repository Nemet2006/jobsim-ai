'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Users, ClipboardList, ArrowRight, Loader2, Folders,
  Copy, Check, BookOpen, Hash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'

interface Group {
  id: string
  name: string
  description: string | null
  join_code: string | null
  created_at: string
  memberCount: number
  simCount: number
}

interface GroupsClientProps {
  groups: Group[]
  instructorId: string
}

export function GroupsClient({ groups, instructorId }: GroupsClientProps) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-mid">
          <span className="font-semibold text-ink">{groups.length}</span>{' '}
          qrup yaradılıb
        </p>
        <button onClick={() => setShowCreate(true)} className="btn-coral">
          <Plus size={15} aria-hidden="true" />
          Yeni qrup yarat
        </button>
      </div>

      {groups.length > 0 ? (
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {groups.map((group) => (
            <StaggerItem key={group.id}>
              <GroupCard group={group} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateGroupModal
            instructorId={instructorId}
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Group Card ---------- */

function JoinCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function copy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      title="Kodu kopyala"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-forest/15 bg-forest-wash text-forest font-mono text-xs font-bold hover:bg-forest hover:text-cream transition-colors group"
      aria-label={`Qoşulma kodu: ${code}. Kopyalamaq üçün kliklə.`}
    >
      <Hash size={10} aria-hidden="true" />
      {code}
      {copied
        ? <Check size={10} className="text-success" aria-hidden="true" />
        : <Copy size={10} className="opacity-50 group-hover:opacity-100" aria-hidden="true" />}
    </button>
  )
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/courses/groups/${group.id}`}
      className="group block card p-6 hover:shadow-soft-md hover:border-forest/20 transition-all hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-forest text-cream flex items-center justify-center font-display text-xl font-semibold group-hover:scale-105 transition-transform">
          {group.name[0]?.toUpperCase()}
        </div>
        <ArrowRight
          size={18}
          className="text-ink-mute group-hover:text-coral group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      </div>

      <h3 className="font-display text-xl font-semibold text-ink mb-1 leading-tight group-hover:text-forest transition-colors">
        {group.name}
      </h3>
      {group.description && (
        <p className="text-sm text-ink-mid line-clamp-2 mb-3">{group.description}</p>
      )}

      {/* Join code */}
      {group.join_code && (
        <div className="mb-4" onClick={(e) => e.preventDefault()}>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold mb-1.5">
            Tələbə qoşulma kodu
          </p>
          <JoinCodeBadge code={group.join_code} />
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-forest/8">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-mid">
          <Users size={12} className="text-forest" aria-hidden="true" />
          {group.memberCount} tələbə
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-mid">
          <ClipboardList size={12} className="text-coral-deep" aria-hidden="true" />
          {group.simCount} simulyasiya
        </span>
      </div>
    </Link>
  )
}

/* ---------- Empty state ---------- */

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card p-14 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-forest-wash flex items-center justify-center">
        <Folders size={36} className="text-forest" aria-hidden="true" />
      </div>
      <h3 className="font-display text-3xl font-semibold mb-3">Hələ qrup yoxdur</h3>
      <p className="text-ink-mid text-base mb-8 max-w-md mx-auto leading-relaxed">
        Qrup yaradın — tələbələrə <strong>qoşulma kodu</strong> göndərin, onlar öz
        dashboard-larından kodu daxil edib qrupa qoşulacaqlar.
      </p>

      <button onClick={onCreateClick} className="btn-coral px-6 py-3 mb-10">
        <Plus size={15} aria-hidden="true" />
        İlk qrupu yarat
      </button>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
        {[
          { n: '1', t: 'Qrup yarat', d: 'Adını, açıqlamasını yazın. Avtomatik unikal kod yaranır.' },
          { n: '2', t: 'Kodu paylaş', d: 'Tələbələrə 6 simvolluk kodu göndərin (WhatsApp, e-mail və s.).' },
          { n: '3', t: 'Simulyasiya ver', d: 'HR şirkət simulyasiyalarından seçin, bütün qrupa bir anda verin.' },
        ].map((step) => (
          <div key={step.n} className="card-cream p-4">
            <div className="w-8 h-8 rounded-full bg-forest text-cream font-display font-semibold text-sm flex items-center justify-center mb-3">
              {step.n}
            </div>
            <h4 className="font-semibold text-ink text-sm mb-1">{step.t}</h4>
            <p className="text-xs text-ink-mid leading-relaxed">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Create Group Modal ---------- */

function CreateGroupModal({
  instructorId,
  onClose,
}: {
  instructorId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ name: string; join_code: string } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('course_groups')
      .insert({
        instructor_id: instructorId,
        name: name.trim(),
        description: description.trim() || null,
      })
      .select('name, join_code')
      .single()

    if (err) {
      setError(`Xəta: ${err.message}`)
      setLoading(false)
      return
    }

    setLoading(false)
    setCreated({ name: data.name, join_code: data.join_code || '------' })
    startTransition(() => router.refresh())
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
        onClick={!created ? onClose : undefined}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="card p-7 w-full max-w-md pointer-events-auto">

          {/* Success view */}
          {created ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-forest text-cream flex items-center justify-center font-display text-2xl font-semibold mx-auto mb-5">
                {created.name[0]?.toUpperCase()}
              </div>
              <span className="h-eyebrow block mb-2">Qrup yaradıldı!</span>
              <h2 className="font-display text-2xl font-semibold mb-1">
                {created.name}<span className="text-coral">.</span>
              </h2>
              <p className="text-sm text-ink-mid mb-6">
                Bu kodu tələbələrə göndərin — onlar öz dashboard-larından qrupa qoşulacaqlar.
              </p>
              <div className="bg-forest text-cream rounded-2xl px-6 py-5 mb-6">
                <p className="text-xs uppercase tracking-wider text-cream/60 font-semibold mb-2">Qoşulma kodu</p>
                <p className="font-mono text-4xl font-bold tracking-widest">{created.join_code}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(created.join_code).catch(() => {})
                }}
                className="btn-secondary w-full mb-3"
              >
                <Copy size={14} aria-hidden="true" />
                Kodu kopyala
              </button>
              <button onClick={onClose} className="btn-coral w-full">
                Bağla
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="h-eyebrow block mb-1.5">Yeni qrup</span>
                  <h2 id="create-group-title" className="font-display text-2xl font-semibold">
                    Qrup yarat<span className="text-coral">.</span>
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
                <div role="alert" className="mb-5 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label htmlFor="group-name" className="block text-sm font-semibold text-ink mb-2">
                    Qrup adı <span className="text-coral">*</span>
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="məs. Marketing A, Kurs 2025"
                    required
                    className="ed-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="group-desc" className="block text-sm font-semibold text-ink mb-2">
                    Açıqlama <span className="text-ink-mid font-normal">· Opsional</span>
                  </label>
                  <textarea
                    id="group-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bu qrup hansı tələbələri əhatə edir?"
                    rows={3}
                    className="ed-input resize-none"
                  />
                </div>
                <p className="text-xs text-ink-mute flex items-center gap-1.5">
                  <Hash size={11} aria-hidden="true" />
                  Yaradıldıqdan sonra avtomatik unikal qoşulma kodu yaranacaq
                </p>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
                    İmtina
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="btn-coral flex-1 py-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus size={16} aria-hidden="true" />
                    )}
                    <span>Yarat</span>
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
