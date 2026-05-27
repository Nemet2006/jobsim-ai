'use client'

import type { User } from '@/types'
import { LayoutDashboard, PlaySquare, ClipboardList, Award, GraduationCap, BookOpen, Zap } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'

interface StudentLayoutProps {
  children: React.ReactNode
  user: User
}

const navItems: NavItem[] = [
  { href: '/student/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/student/courses',        label: 'Kurslarım',        icon: BookOpen },
  { href: '/student/simulations',    label: 'Simulyasiyalar',   icon: PlaySquare },
  { href: '/student/premium',        label: 'Premium',          icon: Zap },
  { href: '/student/results',        label: 'Nəticələr',        icon: ClipboardList },
  { href: '/student/skill-passport', label: 'Bacarıq Pasportu', icon: Award },
]

export default function StudentLayout({ children, user }: StudentLayoutProps) {
  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: 'Tələbə', section: 'STUDENT EDITION', icon: GraduationCap }}
    >
      {children}
    </AppShell>
  )
}
