'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

interface PremiumUpgradeButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'coral' | 'coral-full' | 'link'
}

export function PremiumUpgradeButton({
  className = '',
  children,
  variant = 'coral-full',
}: PremiumUpgradeButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-colors touch-manipulation'

  if (variant === 'link') {
    return (
      <Link href="/student/premium" className={`link-arrow text-sm ${className}`}>
        {children || 'Premium-a keç'}
      </Link>
    )
  }

  if (variant === 'coral') {
    return (
      <Link href="/student/premium" className={`btn-coral ${className}`}>
        <Zap size={14} aria-hidden="true" />
        {children || 'Premium Al'}
      </Link>
    )
  }

  return (
    <Link
      href="/student/premium"
      className={`${base} bg-coral hover:bg-coral-deep text-white px-5 py-3 rounded-full ${className}`}
    >
      <Zap size={16} aria-hidden="true" />
      {children || 'İndi Yüksəlt'}
    </Link>
  )
}
