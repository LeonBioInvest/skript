import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:           'rgb(var(--bg) / <alpha-value>)',
        surface:      'rgb(var(--surface) / <alpha-value>)',
        surface2:     'rgb(var(--surface2) / <alpha-value>)',
        surface3:     'rgb(var(--surface3) / <alpha-value>)',
        border:       'rgb(var(--border) / <alpha-value>)',
        accent:       'rgb(var(--accent) / <alpha-value>)',
        'accent-dim': 'rgb(var(--accent-dim) / <alpha-value>)',
        blue:         'rgb(var(--blue) / <alpha-value>)',
        purple:       'rgb(var(--purple) / <alpha-value>)',
        err:          'rgb(var(--err) / <alpha-value>)',
        warn:         'rgb(var(--warn) / <alpha-value>)',
        text:         'rgb(var(--text) / <alpha-value>)',
        text2:        'rgb(var(--text2) / <alpha-value>)',
        text3:        'rgb(var(--text3) / <alpha-value>)',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '20px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        ringFill: {
          from: { strokeDashoffset: '314' },
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'scale-in':  'scaleIn 0.25s ease forwards',
        'slide-up':  'slideUp 0.35s ease forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
