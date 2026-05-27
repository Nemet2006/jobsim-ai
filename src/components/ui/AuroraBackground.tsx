'use client'

interface AuroraBackgroundProps {
  variant?: 'default' | 'auth' | 'subtle'
  className?: string
}

/**
 * Light, Forage-style atmospheric backdrop — subtle warm cream tones.
 * Not aurora anymore — kept name for back-compat.
 */
export function AuroraBackground({ variant = 'default', className = '' }: AuroraBackgroundProps) {
  if (variant === 'auth') {
    return (
      <div
        className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-cream" />
        <div
          className="absolute top-0 left-1/3 w-[80vw] h-[60vh] opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(244,126,71,0.10) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[60vw] h-[50vh] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(31,78,74,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Soft dot pattern */}
        <div className="absolute inset-0 opacity-[0.4] bg-dot-pattern" />
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(244,126,71,0.08), transparent 70%)', filter: 'blur(80px)' }} />
    </div>
  )
}
