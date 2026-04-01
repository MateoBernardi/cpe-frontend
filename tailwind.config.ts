import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './admin.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cpe: {
          'light-gray':  '#eeeeee',
          'teal-bright': '#0db6b4',
          'teal-mid':    '#01888d',
          'teal-deep':   '#036f73',
          'blue-mid':    '#0b6383',
          'blue-dark':   '#064860',
          'off-white':   '#f8faf9',
        },
      },
      fontFamily: {
        primary: ["'Segoe UI'", 'Roboto', "'Helvetica Neue'", 'Arial', 'sans-serif'],
        secondary: ['Georgia', "'Times New Roman'", 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config

