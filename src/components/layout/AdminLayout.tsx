'use client'

import type { User } from '@/types'
import { LayoutDashboard, Activity, ShieldCheck } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'

interface AdminLayoutProps {
  children: React.ReactNode
  user: User
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Core stats', icon: LayoutDashboard },
  { href: '/admin/events',    label: 'Hadisələr', icon: Activity },
]

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <AppShell
      user={user}
      navItems={navItems}
      brand={{ label: 'Admin', section: 'PLATFORM ADMIN', icon: ShieldCheck }}
    >
      {children}
    </AppShell>
  )
}
