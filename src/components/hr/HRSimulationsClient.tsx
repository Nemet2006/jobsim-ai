'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Simulation } from '@/types'
import { formatDate, getDifficultyLabel, getDifficultyClass } from '@/lib/utils'
import { Plus, Edit, Trash2, Eye, EyeOff, Users, BarChart2 } from 'lucide-react'

interface HRSimulationsClientProps {
  simulations: Simulation[]
  candidateCounts: Record<string, number>
  avgScores: Record<string, number>
}

export default function HRSimulationsClient({ simulations, candidateCounts, avgScores }: HRSimulationsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function togglePublished(id: string, current: boolean) {
    await supabase.from('simulations').update({ is_published: !current }).eq('id', id)
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu simulyasiyanı silmək istədiyinizə əminsiniz?')) return
    setDeletingId(id)
    await supabase.from('simulations').delete().eq('id', id)
    startTransition(() => router.refresh())
    setDeletingId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Simulyasiyalar</h1>
          <p className="text-ink-mute text-sm mt-1">{simulations.length} simulyasiya</p>
        </div>
        <Link href="/hr/simulations/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Yeni Simulyasiya
        </Link>
      </div>

      {simulations.length === 0 ? (
        <div className="card-dossier p-12 text-center">
          <Plus size={40} className="text-ink-mute mx-auto mb-4" />
          <p className="text-ink-mute mb-4">Hələ simulyasiya yaratmamısınız</p>
          <Link href="/hr/simulations/create" className="btn-primary">İlk Simulyasiyanı Yarat</Link>
        </div>
      ) : (
        <div className="card-dossier overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/8">
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3">Başlıq</th>
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden md:table-cell">Çətinlik</th>
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden lg:table-cell">Namizəd</th>
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden lg:table-cell">Orta bal</th>
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3">Status</th>
                <th className="text-left text-xs text-ink-mute font-medium px-5 py-3 hidden md:table-cell">Tarix</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim) => (
                <tr key={sim.id} className="border-b border-navy/8 hover:bg-navy-wash/60 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{sim.title}</p>
                      <p className="text-xs text-ink-mute mt-0.5">{sim.role_type}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={getDifficultyClass(sim.difficulty)}>
                      {getDifficultyLabel(sim.difficulty)}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-ink-mid">
                      <Users size={13} className="text-ink-mute" />
                      {candidateCounts[sim.id] || 0}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-ink-mid">
                      <BarChart2 size={13} className="text-ink-mute" />
                      {avgScores[sim.id] || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => togglePublished(sim.id, sim.is_published)}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
                        sim.is_published
                          ? 'bg-verdigris-wash border-verdigris/30 text-verdigris hover:bg-verdigris/20'
                          : 'bg-paper-deep border-navy/10 text-ink-mute hover:border-navy/20'
                      }`}
                    >
                      {sim.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {sim.is_published ? 'Yayımlanıb' : 'Qaralama'}
                    </button>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-xs text-ink-mute">
                    {formatDate(sim.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(sim.id)}
                        disabled={deletingId === sim.id}
                        className="text-ink-mute hover:text-danger transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                      <Link href={`/hr/simulations/${sim.id}/edit`} className="text-ink-mute hover:text-navy transition-colors">
                        <Edit size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
