interface AuroraBackgroundProps {
  variant?: 'default' | 'auth' | 'subtle'
  className?: string
}

/**
 * Corporate atmospheric backdrop — soft navy/gold washes on paper.
 * Server component (no JS). Avoids heavy CSS blur filters for paint cost.
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
          className="absolute -top-24 left-1/4 w-[70vw] h-[50vh] opacity-50"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(184,134,46,0.10) 0%, transparent 68%)',
          }}
        />
        <div
          className="absolute -bottom-16 right-1/5 w-[55vw] h-[45vh] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(22,40,61,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.28] bg-dot-pattern" />
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(184,134,46,0.08), transparent 70%)',
        }}
      />
    </div>
  )
}
