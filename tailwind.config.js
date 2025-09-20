/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cemai: {
          primary: '#3b82f6',
          secondary: '#22c55e',
          accent: '#f59e0b',
          stable: '#22c55e',
          warning: '#f59e0b',
          critical: '#ef4444',
        },
        dark: {
          background: '#0a0a0a',
          surface: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}


