'use client'

interface AuroraBackgroundProps {
  variant?: 'default' | 'auth' | 'subtle'
  className?: string
}

/**
 * Corporate atmospheric backdrop — soft navy/gold washes on paper.
 */
export function AuroraBackground({ variant = 'default', className = '' }: AuroraBackgroundProps) {
  if (variant === 'auth') {
    return (
      <div
        className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-paper" />
        <div
          className="absolute top-0 left-1/3 w-[70vw] h-[50vh] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(184,134,46,0.08) 0%, transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[55vw] h-[45vh] opacity-35"
          style={{
            background: 'radial-gradient(circle, rgba(22,40,61,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.35] bg-dot-pattern" />
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(184,134,46,0.07), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
