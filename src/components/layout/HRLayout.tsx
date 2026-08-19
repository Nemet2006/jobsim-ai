'use client'

import type { User } from '@/types'
import {
  LayoutDashboard,
  PlaySquare,
  Users,
  Star,
  GitCompare,
  BarChart2,
  Briefcase,
  Zap,
} from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'
import { useT } from '@/i18n/I18nProvider'

interface HRLayoutProps {
  children: React.ReactNode
  user: User
}

export default function HRLayout({ children, user }: HRLayoutProps) {
  const { t } = useT()
  const navItems: NavItem[] = [
    { href: '/hr/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/hr/simulations', label: t('nav.simulations'), icon: PlaySquare },
    { href: '/hr/candidates', label: t('nav.candidates'), icon: Users },
    { href: '/hr/shortlist', label: t('nav.shortlist'), icon: Star },
    { href: '/hr/compare', label: t('nav.compare'), icon: GitCompare },
    { href: '/hr/reports', label: t('nav.reports'), icon: BarChart2 },
    { href: '/hr/abonelik', label: t('nav.subscription'), icon: Zap },
  ]
  const section = user.company_name
    ? `${user.company_name.toUpperCase()} · ${t('nav.hrSection')}`
    : t('nav.hrSection')
  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: t('nav.hrBrand'), section, icon: Briefcase }}
    >
      <div className="hr-theme">{children}</div>
    </AppShell>
  )
}
