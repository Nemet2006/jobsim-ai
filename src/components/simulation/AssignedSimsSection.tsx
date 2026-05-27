'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight, GraduationCap, CalendarClock } from 'lucide-react'
import { getDifficultyLabel, getDifficultyClass } from '@/lib/utils'
import type { Simulation, Difficulty } from '@/types'

type AssignedSim = Simulation & {
  creator?: { full_name: string; company_name: string } | null
  _groupName?: string
  _deadline?: string | null
}

interface Props {
  sims: AssignedSim[]
}

/**
 * Assigned-by-instructor section on student simulations page.
 * Shows sims that a Courses instructor assigned to the student's group(s).
 */
export function AssignedSimsSection({ sims }: Props) {
  return (
    <section aria-labelledby="assigned-title">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-forest text-cream flex items-center justify-center">
              <GraduationCap size={14} aria-hidden="true" />
            </div>
            <span className="h-eyebrow">Müəllim tərəfindən verilmiş</span>
          </div>
          <h2 id="assigned-title" className="font-display text-2xl lg:text-3xl font-semibold">
            Tapşırıqlarınız<span className="text-coral">.</span>
          </h2>
          <p className="text-sm text-ink-mid mt-1.5">
            Müəlliminiz bu simulyasiyaları sizin üçün seçib. Onları tamamlayın.
          </p>
        </div>
        <span className="tag-forest hidden sm:inline-flex">
          {sims.length} tapşırıq
        </span>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sims.map((sim, idx) => {
          const diff = sim.difficulty as Difficulty
          const isOverdue = sim._deadline
            ? new Date(sim._deadline) < new Date()
            : false
          const deadlineStr = sim._deadline
            ? new Date(sim._deadline).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })
            : null

          return (
            <motion.article
              key={sim.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/student/simulations/${sim.id}`}
                className="group block h-full card p-5 lg:p-6 border-l-4 border-l-forest hover:shadow-soft-md hover:border-forest/20 transition-all hover:-translate-y-1"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-forest text-cream font-display text-lg font-semibold flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {(sim.creator?.company_name || sim.title)[0]?.toUpperCase()}
                    </div>
                    {sim.creator?.company_name && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">From</p>
                        <p className="text-sm font-semibold text-ink truncate max-w-[120px]">
                          {sim.creator.company_name}
                        </p>
                      </div>
                    )}
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-ink-mute group-hover:text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-semibold text-ink mb-2 leading-tight group-hover:text-forest transition-colors text-balance">
                  {sim.title}
                </h3>

                {sim.description && (
                  <p className="text-sm text-ink-mid line-clamp-2 mb-4 leading-relaxed">
                    {sim.description}
                  </p>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-forest/8 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="tag-neutral text-[10px]">{sim.role_type}</span>
                    <span className={`text-[10px] ${getDifficultyClass(diff)}`}>
                      {getDifficultyLabel(diff)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink-mute font-medium">
                      <Clock size={9} aria-hidden="true" />
                      {sim.duration_minutes} dəq
                    </span>
                  </div>

                  {/* Group + deadline info */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {sim._groupName && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-forest font-semibold">
                        <GraduationCap size={10} aria-hidden="true" />
                        {sim._groupName}
                      </span>
                    )}
                    {deadlineStr && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          isOverdue ? 'text-danger' : 'text-coral-deep'
                        }`}
                        aria-label={`Son tarix: ${deadlineStr}`}
                      >
                        <CalendarClock size={10} aria-hidden="true" />
                        {isOverdue ? 'Vaxtı keçib · ' : ''}{deadlineStr}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.article>
          )
        })}
      </div>

      {/* Divider */}
      <div className="mt-10 flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-forest/8" />
        <span className="text-xs uppercase tracking-widest text-ink-mute font-semibold">Ümumi kitabxana</span>
        <div className="h-px flex-1 bg-forest/8" />
      </div>
    </section>
  )
}
