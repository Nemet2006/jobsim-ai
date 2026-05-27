'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  count?: number | string
  icon?: ReactNode
  content: ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultTab?: string
  sticky?: boolean
}

/**
 * Forage-style tabs — underline + smooth content transition.
 * Sticky variant pins the tab bar below the navbar on scroll.
 */
export function Tabs({ items, defaultTab, sticky = false }: TabsProps) {
  const [active, setActive] = useState(defaultTab || items[0]?.id)

  if (!items.length) return null
  const activeItem = items.find((i) => i.id === active) || items[0]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Səhifə tabları"
        className={`relative border-b border-forest/10 bg-cream/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 ${
          sticky ? 'sticky top-16 lg:top-18 z-30' : ''
        }`}
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {items.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-forest' : 'text-ink-mute hover:text-forest'
                }`}
              >
                {tab.icon && (
                  <span className={isActive ? 'text-forest' : 'text-ink-mute'} aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold ${
                      isActive ? 'bg-forest text-cream' : 'bg-forest-wash text-forest'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="active-tab-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-coral rounded-full"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-8" id={`tabpanel-${activeItem.id}`} role="tabpanel" aria-labelledby={`tab-${activeItem.id}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeItem.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
