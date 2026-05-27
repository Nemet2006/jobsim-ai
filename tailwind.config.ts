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
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Forage palette — light, friendly, professional
        cream: {
          DEFAULT: '#FAF5EC',
          deep: '#F5EBD9',
          warm: '#FFF7ED',
          paper: '#FDFAF3',
        },
        // Forest green — primary brand
        forest: {
          DEFAULT: '#1F4E4A',
          deep: '#143832',
          rich: '#2A6660',
          soft: '#3F857E',
          mint: '#7FB5AE',
          tint: '#D8E8E5',
          wash: '#EEF5F3',
        },
        // Coral — CTAs, energy
        coral: {
          DEFAULT: '#F47E47',
          deep: '#E26536',
          soft: '#FAA277',
          tint: '#FCE4D4',
          wash: '#FFF4EC',
        },
        // Sunshine yellow — highlights, achievement
        sun: {
          DEFAULT: '#F5C842',
          deep: '#E5B41E',
          soft: '#FAD876',
          tint: '#FCEFC2',
          wash: '#FFF8E0',
        },
        // Ink — text
        ink: {
          DEFAULT: '#1A1A1A',
          dim: '#3D3D3D',
          mid: '#5C5C5C',
          mute: '#8A8A8A',
          subtle: '#B5B5B5',
          ghost: '#E0E0E0',
        },
        // Semantic
        success: { DEFAULT: '#22A06B', soft: '#7BC9A1', tint: '#D9EFE3' },
        danger:  { DEFAULT: '#E14B4B', soft: '#F08585', tint: '#FBDADA' },
        info:    { DEFAULT: '#2E6FE6', soft: '#7BA4F2', tint: '#DBE7FB' },
      },
      backgroundImage: {
        'forest-radial': 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(31, 78, 74, 0.06), transparent 70%)',
        'cream-glow': 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(244, 126, 71, 0.05), transparent 70%)',
        'card-pattern': "radial-gradient(circle at 1px 1px, rgba(31,78,74,0.06) 1px, transparent 0)",
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
        'soft-sm':  '0 1px 2px rgba(20, 56, 50, 0.06), 0 1px 1px rgba(20, 56, 50, 0.04)',
        'soft':     '0 4px 10px -2px rgba(20, 56, 50, 0.08), 0 2px 4px -1px rgba(20, 56, 50, 0.04)',
        'soft-md':  '0 8px 20px -4px rgba(20, 56, 50, 0.1), 0 4px 8px -2px rgba(20, 56, 50, 0.06)',
        'soft-lg':  '0 16px 32px -8px rgba(20, 56, 50, 0.12), 0 8px 16px -4px rgba(20, 56, 50, 0.06)',
        'soft-xl':  '0 24px 48px -12px rgba(20, 56, 50, 0.14), 0 12px 24px -6px rgba(20, 56, 50, 0.08)',
        'coral':    '0 8px 24px -6px rgba(244, 126, 71, 0.4)',
        'forest':   '0 8px 24px -6px rgba(31, 78, 74, 0.35)',
        'card':     '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 4px 12px -2px rgba(20, 56, 50, 0.06)',
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
