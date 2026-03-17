/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        ui: ['"Barlow"', 'sans-serif'],
        mono: ['"Barlow Condensed"', 'sans-serif'],
      },
      colors: {
        base:             'rgb(var(--color-base) / <alpha-value>)',
        card:             'rgb(var(--color-card) / <alpha-value>)',
        elevated:         'rgb(var(--color-elevated) / <alpha-value>)',
        border:           'rgb(var(--color-border) / <alpha-value>)',
        gold:             'rgb(var(--color-gold) / <alpha-value>)',
        'gold-light':     'rgb(var(--color-gold-light) / <alpha-value>)',
        blue:             'rgb(var(--color-blue) / <alpha-value>)',
        'blue-dark':      'rgb(var(--color-blue-dark) / <alpha-value>)',
        green:            'rgb(var(--color-green) / <alpha-value>)',
        red:              'rgb(var(--color-red) / <alpha-value>)',
        'text-primary':   'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted':     'rgb(var(--color-text-muted) / <alpha-value>)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
