'use client'

import type { User } from '@/types'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  GraduationCap,
  Folders,
  Zap,
} from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'
import { useT } from '@/i18n/I18nProvider'

interface CoursesLayoutProps {
  children: React.ReactNode
  user: User
}

export default function CoursesLayout({ children, user }: CoursesLayoutProps) {
  const { t } = useT()
  const navItems: NavItem[] = [
    { href: '/courses/dashboard',  label: t('nav.dashboard'),     icon: LayoutDashboard },
    { href: '/courses/groups',     label: t('nav.groups'),        icon: Folders },
    { href: '/courses/students',   label: t('nav.students'),      icon: Users },
    { href: '/courses/assign',     label: t('nav.assign'),        icon: ClipboardList },
    { href: '/courses/leaderboard',label: t('nav.leaderboard'),   icon: Trophy },
    { href: '/courses/abonelik',   label: t('nav.subscription'),  icon: Zap },
  ]

  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: t('nav.teacherBrand'), section: t('nav.facultySection'), icon: GraduationCap }}
    >
      {children}
    </AppShell>
  )
}
