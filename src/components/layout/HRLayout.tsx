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
      {children}
    </AppShell>
  )
}
