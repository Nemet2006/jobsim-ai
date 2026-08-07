'use client'

import { motion } from 'framer-motion'
import {
  PlaySquare,
  Target,
  Award,
  Zap,
  Users,
  BarChart2,
  Star,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Trophy,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

const ICON_MAP: Record<string, LucideIcon> = {
  play: PlaySquare,
  target: Target,
  award: Award,
  zap: Zap,
  users: Users,
  chart: BarChart2,
  star: Star,
  clipboard: ClipboardList,
  check: CheckCircle,
  trending: TrendingUp,
  trophy: Trophy,
  briefcase: Briefcase,
  graduation: GraduationCap,
}

export type StatIconKey = keyof typeof ICON_MAP

export interface StatItem {
  label: string
  value: number | string
  icon: StatIconKey
  accent: 'forest' | 'coral' | 'sun' | 'success' | 'info' | 'neutral' | 'navy' | 'gold' | 'verdigris'
  suffix?: string
  meta?: string
}

const accentClasses: Record<string, { iconBg: string; iconText: string; ribbon: string }> = {
  forest:    { iconBg: 'bg-navy-wash', iconText: 'text-navy', ribbon: 'bg-navy' },
  navy:      { iconBg: 'bg-navy-wash', iconText: 'text-navy', ribbon: 'bg-navy' },
  coral:     { iconBg: 'bg-gold-wash', iconText: 'text-gold-deep', ribbon: 'bg-gold' },
  gold:      { iconBg: 'bg-gold-wash', iconText: 'text-gold-deep', ribbon: 'bg-gold' },
  sun:       { iconBg: 'bg-gold-wash', iconText: 'text-gold-deep', ribbon: 'bg-gold' },
  success:   { iconBg: 'bg-verdigris-wash', iconText: 'text-verdigris', ribbon: 'bg-verdigris' },
  verdigris: { iconBg: 'bg-verdigris-wash', iconText: 'text-verdigris', ribbon: 'bg-verdigris' },
  info:      { iconBg: 'bg-info-tint', iconText: 'text-info', ribbon: 'bg-info' },
  neutral:   { iconBg: 'bg-paper-deep', iconText: 'text-ink-mid', ribbon: 'bg-ink-mid' },
}

/**
 * Ledger-style stat row — restrained cards, mono numbers, hairline accents.
 */
export function StatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = ICON_MAP[stat.icon] ?? PlaySquare
        const a = accentClasses[stat.accent] ?? accentClasses.navy
        const isNumeric = typeof stat.value === 'number'

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-dossier p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-md ${a.iconBg} flex items-center justify-center`}>
                <Icon size={16} className={a.iconText} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className={`h-1.5 w-8 rounded-sm ${a.ribbon} opacity-80`} aria-hidden="true" />
            </div>

            <p className="number-display text-3xl md:text-4xl mb-1.5">
              {isNumeric ? (
                <AnimatedCounter value={stat.value as number} suffix={stat.suffix} />
              ) : (
                stat.value
              )}
            </p>

            <div>
              <p className="text-sm font-semibold text-ink">{stat.label}</p>
              {stat.meta && <p className="text-xs text-ink-mute mt-0.5">{stat.meta}</p>}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
