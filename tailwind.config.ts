import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Corporate ledger palette — trust, achievement, progress
        navy: {
          DEFAULT: '#16283D',
          deep: '#0F1B2A',
          rich: '#1E3A56',
          soft: '#3A5674',
          tint: '#D4DCE6',
          wash: '#EEF2F6',
        },
        gold: {
          DEFAULT: '#B8862E',
          deep: '#8F6A1F',
          soft: '#D4A84B',
          tint: '#F5E9C8',
          wash: '#FBF6EA',
        },
        verdigris: {
          DEFAULT: '#1E7A63',
          deep: '#155A49',
          soft: '#3FA88A',
          tint: '#D5EDE6',
          wash: '#EEF7F4',
        },
        paper: {
          DEFAULT: '#F6F3EC',
          deep: '#EDE8DC',
          warm: '#FBF9F4',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#15181D',
          dim: '#2C313A',
          mid: '#4A5160',
          mute: '#7A8290',
          subtle: '#A8B0BC',
          ghost: '#D5DAE2',
        },
        // Semantic — Alert Ember only for real danger
        success: { DEFAULT: '#1E7A63', soft: '#3FA88A', tint: '#D5EDE6' },
        danger:  { DEFAULT: '#C4432E', soft: '#E0705C', tint: '#F8DDD8' },
        info:    { DEFAULT: '#2E5A8C', soft: '#6B8FB8', tint: '#D9E4F0' },

        // Backward-compat aliases (map old forage tokens → new system)
        cream: {
          DEFAULT: '#F6F3EC',
          deep: '#EDE8DC',
          warm: '#FBF9F4',
          paper: '#FFFFFF',
        },
        forest: {
          DEFAULT: '#16283D',
          deep: '#0F1B2A',
          rich: '#1E3A56',
          soft: '#3A5674',
          mint: '#6B8FB8',
          tint: '#D4DCE6',
          wash: '#EEF2F6',
        },
        coral: {
          DEFAULT: '#B8862E',
          deep: '#8F6A1F',
          soft: '#D4A84B',
          tint: '#F5E9C8',
          wash: '#FBF6EA',
        },
        sun: {
          DEFAULT: '#B8862E',
          deep: '#8F6A1F',
          soft: '#D4A84B',
          tint: '#F5E9C8',
          wash: '#FBF6EA',
        },
      },
      backgroundImage: {
        'navy-radial': 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(22, 40, 61, 0.06), transparent 70%)',
        'paper-glow': 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(184, 134, 46, 0.04), transparent 70%)',
        'card-pattern': "radial-gradient(circle at 1px 1px, rgba(22,40,61,0.05) 1px, transparent 0)",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      opacity: {
        '4':  '0.04',
        '6':  '0.06',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
        '22': '0.22',
        '85': '0.85',
      },
      boxShadow: {
        'soft-sm':  '0 1px 2px rgba(15, 27, 42, 0.05), 0 1px 1px rgba(15, 27, 42, 0.03)',
        'soft':     '0 2px 8px -2px rgba(15, 27, 42, 0.07), 0 1px 3px -1px rgba(15, 27, 42, 0.04)',
        'soft-md':  '0 6px 16px -4px rgba(15, 27, 42, 0.09), 0 2px 6px -2px rgba(15, 27, 42, 0.05)',
        'soft-lg':  '0 12px 28px -8px rgba(15, 27, 42, 0.11), 0 4px 12px -4px rgba(15, 27, 42, 0.06)',
        'soft-xl':  '0 20px 40px -12px rgba(15, 27, 42, 0.13), 0 8px 20px -6px rgba(15, 27, 42, 0.07)',
        'navy':     '0 6px 20px -6px rgba(22, 40, 61, 0.35)',
        'gold':     '0 6px 20px -6px rgba(184, 134, 46, 0.35)',
        // Compat aliases
        'coral':    '0 6px 20px -6px rgba(184, 134, 46, 0.35)',
        'forest':   '0 6px 20px -6px rgba(22, 40, 61, 0.35)',
        'card':     '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 2px 8px -2px rgba(15, 27, 42, 0.06)',
      },
      animation: {
        'fade-up':       'fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards',
        'fade-in':       'fadeIn 0.6s ease-out backwards',
        'scale-in':      'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        'slide-up':      'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards',
        'breathe':       'breathe 6s ease-in-out infinite',
        'marquee':       'marquee 40s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.04)', opacity: '0.7' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
