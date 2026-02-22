/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        fg: 'var(--color-fg)',
        dim: 'var(--color-dim)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        hover: 'var(--color-hover)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warn: 'var(--color-warn)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        h1: ['14px', { lineHeight: '1.4', letterSpacing: '0.19em', fontWeight: '500', textTransform: 'uppercase' }],
        h2: ['13px', { lineHeight: '1.4', letterSpacing: '0.13em', fontWeight: '500', textTransform: 'uppercase' }],
        body: ['13px', { lineHeight: '1.5', letterSpacing: '0.019em', fontWeight: '400' }],
        'body-strong': ['13px', { lineHeight: '1.5', letterSpacing: '0.019em', fontWeight: '500' }],
        small: ['11px', { lineHeight: '1.4', letterSpacing: '0.055em', fontWeight: '400' }],
        'small-strong': ['11px', { lineHeight: '1.4', letterSpacing: '0.11em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
