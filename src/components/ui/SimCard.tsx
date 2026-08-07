'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight } from 'lucide-react'

export type Difficulty = 'easy' | 'medium' | 'hard'

interface SimCardProps {
  href: string
  title: string
  company?: string | null
  category?: string | null
  difficulty?: Difficulty
  duration?: string | null
  description?: string | null
  badge?: string
  completions?: number
  delay?: number
}

const difficultyConfig: Record<Difficulty, { label: string; cls: string }> = {
  easy:   { label: 'Introductory', cls: 'pill-difficulty-intro' },
  medium: { label: 'Intermediate', cls: 'pill-difficulty-inter' },
  hard:   { label: 'Advanced',     cls: 'pill-difficulty-adv' },
}

export function SimCard({ href, title, company, category, difficulty, duration, description, badge, completions, delay = 0 }: SimCardProps) {
  const diff = difficulty ? difficultyConfig[difficulty] : null
  const initial = (company || title)[0]?.toUpperCase() || 'J'

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group block card-dossier p-5 h-full hover:shadow-soft-md hover:border-navy/20 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-navy text-paper font-display text-base font-semibold flex items-center justify-center shrink-0">
              {initial}
            </div>
            {company && (
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-mute font-semibold">From</p>
                <p className="text-sm font-semibold text-ink truncate">{company}</p>
              </div>
            )}
          </div>
          {badge && <span className="tag-gold">{badge}</span>}
          {!badge && completions !== undefined && completions > 0 && (
            <span className="tag-neutral">{completions.toLocaleString('az-AZ')} tamamlanmış</span>
          )}
        </div>

        <h3 className="font-display text-lg lg:text-xl font-semibold text-ink mb-2 leading-tight group-hover:text-navy transition-colors text-balance">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-ink-mid line-clamp-2 mb-4 leading-relaxed">{description}</p>
        )}

        {/* Footer pills */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-forest/8">
          <div className="flex items-center gap-2 flex-wrap">
            {category && <span className="tag-neutral">{category}</span>}
            {diff && <span className={diff.cls}>{diff.label}</span>}
            {duration && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-mute font-medium">
                <Clock size={11} aria-hidden="true" />
                {duration}
              </span>
            )}
          </div>
          <ArrowUpRight
            size={18}
            className="text-ink-mute group-hover:text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.article>
  )
}
