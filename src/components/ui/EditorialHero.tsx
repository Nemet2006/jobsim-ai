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
 * Corporate ledger hero — restrained eyebrow, bold display headline,
 * supporting dek, optional CTA row and meta ledger line.
 */
export function EditorialHero({ eyebrow, title, dek, actions, meta }: EditorialHeroProps) {
  return (
    <header className="relative pb-8 mb-8 border-b border-navy/10">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="h-eyebrow">{eyebrow}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="h-display text-balance text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] mb-4 max-w-4xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl text-base lg:text-lg text-ink-mid leading-relaxed mb-6 text-balance"
      >
        {dek}
      </motion.p>

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          {actions}
        </motion.div>
      )}

      {meta && meta.length > 0 && (
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm"
        >
          {meta.map((m, i) => (
            <div key={m.label} className="flex items-center gap-3">
              {i > 0 && <span className="h-4 w-px bg-navy/15" aria-hidden="true" />}
              <div>
                <dt className="text-ink-mute text-[10px] uppercase tracking-[0.14em] font-semibold mb-0.5">{m.label}</dt>
                <dd className="text-ink font-semibold font-mono tabular-nums">{m.value}</dd>
              </div>
            </div>
          ))}
        </motion.dl>
      )}
    </header>
  )
}
