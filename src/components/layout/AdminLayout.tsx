'use client'

import type { User } from '@/types'
import AdminShell from './AdminShell'

interface AdminLayoutProps {
  children: React.ReactNode
  user: User
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  return <AdminShell user={user}>{children}</AdminShell>
}
