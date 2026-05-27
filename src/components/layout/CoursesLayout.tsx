'use client'

import type { User } from '@/types'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  GraduationCap,
  Folders,
} from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'

interface CoursesLayoutProps {
  children: React.ReactNode
  user: User
}

const navItems: NavItem[] = [
  { href: '/courses/dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/courses/groups',     label: 'Qruplar',          icon: Folders },
  { href: '/courses/students',   label: 'Tələbələr',        icon: Users },
  { href: '/courses/assign',     label: 'Tapşırıq Ver',     icon: ClipboardList },
  { href: '/courses/leaderboard',label: 'Reytinq',          icon: Trophy },
]

export default function CoursesLayout({ children, user }: CoursesLayoutProps) {
  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: 'Müəllim', section: 'FACULTY EDITION', icon: GraduationCap }}
    >
      {children}
    </AppShell>
  )
}
