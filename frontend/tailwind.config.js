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
          DEFAULT: '#6B2737', // Deep Academic Burgundy
          hover: '#57202D',
          light: '#F8F2F4',
          50: '#FAF4F6',
          100: '#F2E4E8',
          200: '#E5C9D1',
          300: '#D3A4B2',
          400: '#A44A63',
          500: '#873347',
          600: '#6B2737',
          700: '#57202D',
          800: '#431823',
          900: '#2E1018',
        },
        ivory: {
          DEFAULT: '#F7F5F0', // Warm Ivory Background
          50: '#FCFBF9',
          100: '#F7F5F0',
          200: '#F1EEE7', // Secondary Surface
          300: '#DDD8CE', // Border
          400: '#C9C2B5',
        },
        accent: {
          DEFAULT: '#B08A4A', // Muted University Gold
          hover: '#98753A',
          light: '#FAF6EE',
          50: '#FAF6EE',
          100: '#F3EAD7',
          200: '#E4D1AC',
          300: '#D2B680',
          400: '#C19F5E',
          500: '#B08A4A',
          600: '#98753A',
          700: '#7D5F2D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1EEE7',
        },
        border: {
          DEFAULT: '#DDD8CE',
          light: '#ECE8E0',
          dark: '#BDB7AA',
        },
        text: {
          primary: '#20211F',
          secondary: '#68675F',
          muted: '#8B8980',
        },
        status: {
          success: '#3F6B4F',
          'success-bg': '#EEF5F1',
          warning: '#A47735',
          'warning-bg': '#FAF5EB',
          error: '#9B3D3D',
          'error-bg': '#FBF1F1',
          info: '#375A7E',
          'info-bg': '#EDF3F8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(32, 33, 31, 0.04), 0 1px 2px rgba(32, 33, 31, 0.02)',
        'card': '0 2px 8px -2px rgba(32, 33, 31, 0.06), 0 1px 4px -1px rgba(32, 33, 31, 0.03)',
        'elevated': '0 8px 24px -4px rgba(107, 39, 55, 0.08), 0 4px 12px -2px rgba(32, 33, 31, 0.04)',
      }
    },
  },
  plugins: [],
}
