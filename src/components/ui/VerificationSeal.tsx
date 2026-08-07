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
}

const VARIANT = {
  navy: { stroke: '#16283D', fill: '#EEF2F6', text: 'text-navy' },
  gold: { stroke: '#B8862E', fill: '#FBF6EA', text: 'text-gold-deep' },
  verdigris: { stroke: '#1E7A63', fill: '#EEF7F4', text: 'text-verdigris' },
}

/**
 * Signature verification seal — used on certificates, premium status,
 * and HR "verified" badges. Server-safe (no client JS).
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
  const r = s.ring / 2
  const radius = r - s.stroke
  const c = 2 * Math.PI * radius
  const pct = typeof score === 'number' ? Math.max(0, Math.min(100, score)) / 100 : 1
  const dash = `${c * pct} ${c}`

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: s.ring, height: s.ring }}>
      <svg width={s.ring} height={s.ring} viewBox={`0 0 ${s.ring} ${s.ring}`} className="-rotate-90" aria-hidden="true">
        <circle cx={r} cy={r} r={radius} fill={v.fill} stroke="rgba(22,40,61,0.08)" strokeWidth={s.stroke} />
        <circle
          cx={r}
          cy={r}
          r={radius}
          fill="none"
          stroke={v.stroke}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {typeof score === 'number' ? (
          <>
            <span className={`font-mono font-semibold tabular-nums leading-none ${v.text} ${s.score}`}>
              {Math.round(score)}
            </span>
            <span className={`font-body uppercase tracking-[0.14em] text-ink-mute font-semibold mt-0.5 ${s.label}`}>
              {label}
            </span>
          </>
        ) : (
          <span className={`font-body uppercase tracking-[0.12em] font-semibold ${v.text} ${s.label}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
