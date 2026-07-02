/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FEBC03',
          50: '#FFF8E1',
          100: '#FFEDB3',
          200: '#FEDE80',
          300: '#FECF4D',
          400: '#FEC52A',
          500: '#FEBC03',
          600: '#E0A500',
          700: '#B98700',
          800: '#926B00',
          900: '#785800',
        },
        graphite: {
          DEFAULT: '#15151A',
          50: '#3A3A45',
          100: '#2E2E37',
          200: '#26262E',
          300: '#1F1F26',
          400: '#1A1A20',
          500: '#15151A',
          600: '#101014',
          700: '#0C0C0F',
          800: '#08080A',
          900: '#040405',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0,0,0,0.45)',
        gold: '0 0 0 1px rgba(254,188,3,0.25), 0 8px 24px -8px rgba(254,188,3,0.25)',
      },
    },
  },
  plugins: [],
}
