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
        base: '#080c14',
        card: '#0f1829',
        elevated: '#162240',
        border: '#1e3058',
        gold: '#f0b429',
        'gold-light': '#fcd34d',
        blue: '#4f9cf9',
        'blue-dark': '#2563eb',
        green: '#34d399',
        red: '#f87171',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #f0b429, 0 0 10px #f0b429' },
          '100%': { boxShadow: '0 0 10px #f0b429, 0 0 25px #f0b429, 0 0 50px #f0b42966' },
        },
      },
    },
  },
  plugins: [],
}
