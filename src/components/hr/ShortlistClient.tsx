'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getScoreColor } from '@/lib/utils'
import { Star, Trash2, GitCompare, User } from 'lucide-react'

interface ShortlistItem {
  id: string
  attempt_id: string
  student: { id: string; full_name: string; university: string | null } | null
  simulation: { title: string; role_type: string } | null
  attempt: { score: number | null; ai_analysis: Record<string, unknown> | null } | null
}

interface ShortlistClientProps {
  items: ShortlistItem[]
  hrId: string
}

export default function ShortlistClient({ items, hrId }: ShortlistClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function removeFromShortlist(id: string) {
    await supabase.from('shortlist').delete().eq('id', id).eq('hr_id', hrId)
    startTransition(() => router.refresh())
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 4) next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shortlist</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} namizəd</p>
        </div>
        {selected.size >= 2 && (
          <Link
            href={`/hr/compare?ids=${[...selected].join(',')}`}
            className="btn-primary flex items-center gap-2"
          >
            <GitCompare size={16} />
            Müqayisə Et ({selected.size})
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Star size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Shortlist boşdur. Namizədlər səhifəsindən əlavə edin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const score = item.attempt?.score ?? null
            const isSelected = selected.has(item.id)

            return (
              <div
                key={item.id}
                className={`glass-card-hover p-5 flex flex-col gap-4 cursor-pointer transition-all ${
                  isSelected ? 'border-teal-500/40 bg-teal-500/5' : ''
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                    {item.student?.full_name?.[0]?.toUpperCase() || <User size={20} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromShortlist(item.id) }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-white">{item.student?.full_name}</p>
                  {item.student?.university && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.student.university}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{item.simulation?.role_type}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{item.simulation?.title}</p>
                  </div>
                  {score !== null && (
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected.size === 1 && (
        <p className="text-center text-xs text-slate-500">Müqayisə üçün ən az 2 namizəd seçin (maks. 4)</p>
      )}
    </div>
  )
}
