import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Professional Hacker theme
        background: {
          primary: '#f8f9fa',    // Light gray
          secondary: '#ffffff',  // White
          tertiary: '#e9ecef',   // Very light gray
          elevated: '#ffffff',
        },
        surface: {
          primary: '#ffffff',
          secondary: '#f1f3f5',
          tertiary: '#e9ecef',
        },
        text: {
          primary: '#212529',    // Dark gray (main text)
          secondary: '#495057',  // Medium gray
          tertiary: '#6c757d',   // Light gray
          muted: '#868e96',
          dim: '#adb5bd',
        },
        accent: {
          primary: '#0d7377',    // Teal/cyan (professional)
          secondary: '#14919b',  // Brighter teal
          success: '#10b981',    // Green
          warning: '#f59e0b',    // Amber
          error: '#ef4444',      // Red
          info: '#3b82f6',       // Blue
        },
        border: {
          primary: '#dee2e6',
          secondary: '#0d7377',
          accent: '#14919b',
          glow: '#0d737740',
        },
        status: {
          valid: '#10b981',
          invalid: '#ef4444',
          unknown: '#f59e0b',
          pending: '#3b82f6',
        },
        terminal: {
          green: '#10b981',
          cyan: '#0d7377',
          yellow: '#f59e0b',
          red: '#ef4444',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px -1px rgba(0, 0, 0, 0.6)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

export default config
