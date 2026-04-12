import type { Config } from 'tailwindcss';

// AXIS color palette — load-bearing per the project's CLAUDE.md.
// These are the colors Garvit chose for his personal aesthetic and they're
// referenced in every visual component of Burnd.
//
// Background `#09090f` is darker than typical "dark mode" — it's near-black
// with a hint of indigo. Surface `#111118` is the next layer up (cards,
// sidebar). Accent `#6366f1` is the indigo signal color used for the
// primary CTAs and the chart highlights.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        axis: {
          bg: '#09090f',
          surface: '#111118',
          surfaceHigh: '#1a1a26',
          border: '#1e1e2e',
          muted: '#252535',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          accentSoft: '#6366f120',
          text: '#e2e8f0',
          textMuted: '#64748b',
          textDim: '#334155',
          success: '#10b981',
          successSoft: '#10b98120',
          warning: '#f59e0b',
          warningSoft: '#f59e0b20',
          danger: '#ef4444',
          dangerSoft: '#ef444420',
          blue: '#3b82f6',
          blueSoft: '#3b82f620',
          purple: '#a855f7',
          purpleSoft: '#a855f720',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
