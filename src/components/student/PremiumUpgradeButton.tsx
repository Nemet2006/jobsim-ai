'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'

interface PremiumUpgradeButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'coral' | 'coral-full' | 'link'
}

/** Links to the Premium coming-soon page (subscription currently disabled). */
export function PremiumUpgradeButton({
  className = '',
  children,
  variant = 'coral-full',
}: PremiumUpgradeButtonProps) {
  const label = children || 'Abunəlik'

  if (variant === 'link') {
    return (
      <Link href="/student/premium" className={`link-arrow text-sm ${className}`}>
        {label}
      </Link>
    )
  }

  if (variant === 'coral') {
    return (
      <Link href="/student/premium" className={`btn-secondary ${className}`}>
        <Clock size={14} aria-hidden="true" />
        {label}
      </Link>
    )
  }

  return (
    <Link
      href="/student/premium"
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors touch-manipulation bg-navy-wash text-navy border border-navy/15 hover:bg-navy hover:text-paper px-5 py-3 rounded-md ${className}`}
    >
      <Clock size={16} aria-hidden="true" />
      {label}
    </Link>
  )
}
