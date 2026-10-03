/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1769E8', // Bright University Blue
          hover: '#0D5BD7',
          light: '#EAF3FF',
          navy: '#0F2942',
          50: '#F5F9FD',
          100: '#EAF3FF',
          200: '#D9E2EC',
          300: '#58A6FF',
          400: '#1769E8',
          500: '#1769E8',
          600: '#0D5BD7',
          700: '#0F2942',
          800: '#0D2237',
          900: '#0A1B2C',
        },
        ivory: {
          DEFAULT: '#F5F9FD', // Very light blue-gray background
          50: '#FFFFFF',
          100: '#F5F9FD',
          200: '#EAF3FF', // Secondary Surface
          300: '#D9E2EC', // Border
          400: '#98A2B3',
        },
        accent: {
          DEFAULT: '#58A6FF', // Highlight text/icons
          hover: '#1769E8',
          light: '#EAF3FF',
          50: '#F5F9FD',
          100: '#EAF3FF',
          200: '#D9E2EC',
          300: '#98A2B3',
          400: '#58A6FF',
          500: '#58A6FF',
          600: '#1769E8',
          700: '#0D5BD7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EAF3FF',
        },
        border: {
          DEFAULT: '#D9E2EC',
          light: '#EAF3FF',
          dark: '#98A2B3',
        },
        text: {
          primary: '#142033', // Dark navy
          secondary: '#667085', // Slate gray
          muted: '#98A2B3', // Light slate
        },
        status: {
          success: '#159947',
          'success-bg': '#ECFDF3',
          warning: '#A47735',
          'warning-bg': '#FAF5EB',
          error: '#D92D20',
          'error-bg': '#FEF3F2',
          info: '#1769E8',
          'info-bg': '#EAF3FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '9px',
        xl: '12px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(15, 41, 66, 0.05)',
        'card': '0 2px 8px rgba(15, 41, 66, 0.05)',
        'elevated': '0 6px 16px rgba(23, 105, 232, 0.22)',
      }
    },
  },
  plugins: [],
}
