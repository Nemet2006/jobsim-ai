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

interface HRLayoutProps {
  children: React.ReactNode
  user: User
}

const navItems: NavItem[] = [
  { href: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hr/simulations', label: 'Simulyasiyalar', icon: PlaySquare },
  { href: '/hr/candidates', label: 'Namizədlər', icon: Users },
  { href: '/hr/shortlist', label: 'Shortlist', icon: Star },
  { href: '/hr/compare', label: 'Müqayisə', icon: GitCompare },
  { href: '/hr/reports', label: 'Hesabatlar', icon: BarChart2 },
  { href: '/hr/abonelik', label: 'Abunəlik', icon: Zap },
]

export default function HRLayout({ children, user }: HRLayoutProps) {
  const section = user.company_name
    ? `${user.company_name.toUpperCase()} · HR EDITION`
    : 'HR EDITION'
  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: 'HR', section, icon: Briefcase }}
    >
      <div className="hr-theme">{children}</div>
    </AppShell>
  )
}
