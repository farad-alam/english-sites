import type { Config } from 'tailwindcss'

/**
 * Every colour, font and corner radius below is a CSS variable that is set per
 * site, on the server, from Sanity → Site Settings → Theme (see lib/theme.ts).
 * The rgb(var(--x) / <alpha-value>) pattern keeps opacity utilities such as
 * bg-brand-primary/10 working.
 */
const rgb = (name: string) => `rgb(var(${name}) / <alpha-value>)`

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './sanity/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: rgb('--brand-primary'),
          dark: rgb('--brand-dark'),
          deep: rgb('--brand-deep'),
          gradient: rgb('--brand-gradient'),
          soft: rgb('--brand-soft'),
        },
        accent: {
          DEFAULT: rgb('--accent'),
          dark: rgb('--accent-dark'),
        },
        on: {
          primary: rgb('--on-primary'),
          accent: rgb('--on-accent'),
        },
        surface: {
          base: rgb('--surface-base'),
          raised: rgb('--surface-raised'),
          card: rgb('--surface-card'),
          border: rgb('--surface-border'),
          hover: rgb('--surface-hover'),
        },
        text: {
          primary: rgb('--text-primary'),
          muted: rgb('--text-muted'),
        },
        state: { error: '#DC2626', success: '#16A34A', warning: '#D97706' },
      },
      borderRadius: {
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        '2xl': 'var(--r-2xl)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        'card-hover': '0 8px 28px -6px rgba(15,23,42,0.14)',
        'sm-light': '0 1px 4px rgba(15,23,42,0.06)',
        'lg-light': '0 10px 32px -6px rgba(15,23,42,0.16)',
      },
      maxWidth: { page: '80rem' },
    },
  },
  plugins: [],
}

export default config
