/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Level 1: Brand & Navigation Identity
        navy: {
          DEFAULT: '#0F2942', // Deep Navy Header & Brand Anchor
          hover: '#0C2135',
          dark: '#081726',
        },
        primary: {
          DEFAULT: '#1557B0', // Controlled Medium Blue (Active tabs, buttons, links ONLY)
          hover: '#104A96',
          light: '#EBF3FE',
          navy: '#0F2942',
          50: '#F4F5F7',
          100: '#EBF3FE',
          200: '#D9E2EC',
          300: '#1557B0',
          500: '#1557B0',
          600: '#104A96',
          700: '#0F2942',
        },
        // Level 2: Page Background
        canvas: {
          DEFAULT: '#F4F5F7', // Very light cool gray
        },
        ivory: {
          DEFAULT: '#F4F5F7',
          50: '#FFFFFF',
          100: '#F4F5F7',
          200: '#EAECEF',
          300: '#D9E2EC',
          400: '#98A2B3',
        },
        // Level 3: Cards & Content Surfaces
        surface: {
          DEFAULT: '#FFFFFF', // Pure White Cards & Inputs
          secondary: '#EAECEF',
        },
        border: {
          DEFAULT: '#D9E2EC',
          light: '#EAECEF',
          dark: '#98A2B3',
        },
        // High-Readability Dark Typography
        text: {
          primary: '#142033', // Deep Dark Navy for maximum contrast
          secondary: '#4A5568', // Slate Charcoal for readable body copy
          muted: '#8C97A8', // Soft Slate for secondary details
        },
        status: {
          success: '#159947',
          'success-bg': '#ECFDF3',
          warning: '#A47735',
          'warning-bg': '#FAF5EB',
          error: '#D92D20',
          'error-bg': '#FEF3F2',
          info: '#1557B0',
          'info-bg': '#EBF3FE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '9px',
        xl: '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 41, 66, 0.05)',
        'card': '0 2px 8px rgba(15, 41, 66, 0.04)',
        'elevated': '0 6px 16px rgba(21, 87, 176, 0.18)',
      }
    },
  },
  plugins: [],
}
