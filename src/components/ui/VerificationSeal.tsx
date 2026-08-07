'use client'

interface VerificationSealProps {
  /** Score 0–100, or omit for status-only seal */
  score?: number | null
  /** Status label shown under the score */
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'navy' | 'gold' | 'verdigris'
  className?: string
}

const SIZE = {
  sm: { ring: 56, stroke: 3, score: 'text-sm', label: 'text-[8px]' },
  md: { ring: 80, stroke: 3.5, score: 'text-xl', label: 'text-[9px]' },
  lg: { ring: 112, stroke: 4, score: 'text-3xl', label: 'text-[10px]' },
} as const

const VARIANT = {
  navy: { stroke: '#16283D', fill: '#EEF2F6', text: 'text-navy' },
  gold: { stroke: '#B8862E', fill: '#FBF6EA', text: 'text-gold-deep' },
  verdigris: { stroke: '#1E7A63', fill: '#EEF7F4', text: 'text-verdigris' },
} as const

/**
 * Signature Verification Seal — circular stamp used for scores,
 * certificates, premium status, and HR "verified" badges.
 */
export function VerificationSeal({
  score,
  label = 'VERIFIED',
  size = 'md',
  variant = 'navy',
  className = '',
}: VerificationSealProps) {
  const s = SIZE[size]
  const v = VARIANT[variant]
  const r = (s.ring - s.stroke) / 2
  const c = 2 * Math.PI * r
  const pct = typeof score === 'number' ? Math.min(100, Math.max(0, score)) / 100 : 1
  const dash = c * pct

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: s.ring, height: s.ring }}
      aria-label={typeof score === 'number' ? `${label}: ${score}` : label}
    >
      <svg width={s.ring} height={s.ring} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx={s.ring / 2}
          cy={s.ring / 2}
          r={r}
          fill={v.fill}
          stroke={v.stroke}
          strokeWidth={s.stroke}
          strokeOpacity={0.15}
        />
        <circle
          cx={s.ring / 2}
          cy={s.ring / 2}
          r={r}
          fill="none"
          stroke={v.stroke}
          strokeWidth={s.stroke}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div className={`relative flex flex-col items-center leading-none ${v.text}`}>
        {typeof score === 'number' ? (
          <>
            <span className={`font-mono font-semibold tabular-nums ${s.score}`}>{score}</span>
            <span className={`font-body font-semibold uppercase tracking-[0.12em] mt-0.5 ${s.label}`}>
              {label}
            </span>
          </>
        ) : (
          <span className={`font-body font-bold uppercase tracking-[0.14em] ${s.label === 'text-[8px]' ? 'text-[9px]' : 'text-[11px]'}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
