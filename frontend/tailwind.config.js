/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8F2',
          100: '#F7F0E5',
          200: '#EBDDC7',
          300: '#DFCBA9',
          400: '#D4B88B',
          500: '#C5A880',
          600: '#AB8E63',
          700: '#8A704B',
          800: '#685335',
          900: '#473721',
        },
        champagne: {
          DEFAULT: '#F4EFEA',
          light: '#FBF9F7',
          dark: '#E7DEC8',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          dark: '#111111',
          muted: '#5A5A5A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Montserrat"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.18em',
        widest: '0.25em',
      }
    },
  },
  plugins: [],
}
