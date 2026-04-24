import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080d18',
        surface: '#0e1525',
        surface2: '#161f33',
        surface3: '#1d2840',
        border: '#1e2d45',
        accent: '#22c55e',
        'accent-dim': '#16a34a',
        'accent-glow': 'rgba(34,197,94,0.12)',
        blue: '#60a5fa',
        'blue-dim': 'rgba(96,165,250,0.12)',
        purple: '#c084fc',
        'purple-dim': 'rgba(192,132,252,0.10)',
        err: '#f87171',
        'err-dim': 'rgba(248,113,113,0.12)',
        warn: '#fbbf24',
        'warn-dim': 'rgba(251,191,36,0.12)',
        text: '#e8f0fe',
        text2: '#8898aa',
        text3: '#3d4f68',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        ringFill: {
          from: { strokeDashoffset: '314' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'scale-in': 'scaleIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
