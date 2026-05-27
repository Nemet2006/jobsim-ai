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
  accent: 'forest' | 'coral' | 'sun' | 'success' | 'info' | 'neutral'
  suffix?: string
  meta?: string
}

const accentClasses: Record<NonNullable<StatItem['accent']>, { iconBg: string; iconText: string; ribbon: string }> = {
  forest:  { iconBg: 'bg-forest-wash', iconText: 'text-forest', ribbon: 'bg-forest' },
  coral:   { iconBg: 'bg-coral-wash',  iconText: 'text-coral-deep', ribbon: 'bg-coral' },
  sun:     { iconBg: 'bg-sun-wash',    iconText: 'text-sun-deep', ribbon: 'bg-sun' },
  success: { iconBg: 'bg-success-tint',iconText: 'text-success', ribbon: 'bg-success' },
  info:    { iconBg: 'bg-info-tint',   iconText: 'text-info', ribbon: 'bg-info' },
  neutral: { iconBg: 'bg-cream-deep',  iconText: 'text-ink-mid', ribbon: 'bg-ink-mid' },
}

export function StatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = ICON_MAP[stat.icon] ?? PlaySquare
        const a = accentClasses[stat.accent]
        const isNumeric = typeof stat.value === 'number'

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3 }}
            className="card p-6 group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl ${a.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon size={20} className={a.iconText} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className={`h-2 w-12 rounded-full ${a.ribbon} opacity-70 group-hover:opacity-100 transition-opacity`} aria-hidden="true" />
            </div>

            <p className="number-display text-5xl md:text-6xl mb-2">
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
