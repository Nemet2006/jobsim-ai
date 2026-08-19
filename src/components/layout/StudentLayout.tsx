'use client'

import type { User } from '@/types'
import { LayoutDashboard, PlaySquare, ClipboardList, Award, GraduationCap, BookOpen, Zap } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'
import { useT } from '@/i18n/I18nProvider'

interface StudentLayoutProps {
  children: React.ReactNode
  user: User
}

export default function StudentLayout({ children, user }: StudentLayoutProps) {
  const { t } = useT()
  const navItems: NavItem[] = [
    { href: '/student/dashboard',      label: t('nav.dashboard'),     icon: LayoutDashboard },
    { href: '/student/courses',        label: t('nav.myCourses'),     icon: BookOpen },
    { href: '/student/simulations',    label: t('nav.simulations'),   icon: PlaySquare },
    { href: '/student/premium',        label: t('nav.subscription'),  icon: Zap },
    { href: '/student/results',        label: t('nav.results'),       icon: ClipboardList },
    { href: '/student/skill-passport', label: t('nav.skillPassport'), icon: Award },
  ]

  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: t('nav.studentBrand'), section: t('nav.studentSection'), icon: GraduationCap }}
    >
      {children}
    </AppShell>
  )
}
