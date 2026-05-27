'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface EditorialHeroProps {
  eyebrow: string
  issue?: string
  title: ReactNode
  dek: ReactNode
  actions?: ReactNode
  meta?: { label: string; value: string }[]
}

/**
 * Forage-style hero — big bold serif headline + dek + actions.
 * Kept exported as `EditorialHero` for back-compat with existing dashboards.
 */
export function EditorialHero({ eyebrow, title, dek, actions, meta }: EditorialHeroProps) {
  return (
    <header className="relative pb-10 mb-10 border-b border-forest/8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 mb-5"
      >
        <span className="h-eyebrow">{eyebrow}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="h-display text-balance text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] mb-5 max-w-4xl font-semibold"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl text-lg lg:text-xl text-ink-mid leading-relaxed mb-7 text-balance"
      >
        {dek}
      </motion.p>

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          {actions}
        </motion.div>
      )}

      {meta && meta.length > 0 && (
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm"
        >
          {meta.map((m, i) => (
            <div key={m.label} className="flex items-center gap-3">
              {i > 0 && <span className="h-4 w-px bg-forest/15" aria-hidden="true" />}
              <div>
                <dt className="text-ink-mute text-xs uppercase tracking-wider font-medium mb-0.5">{m.label}</dt>
                <dd className="text-ink font-semibold">{m.value}</dd>
              </div>
            </div>
          ))}
        </motion.dl>
      )}
    </header>
  )
}
