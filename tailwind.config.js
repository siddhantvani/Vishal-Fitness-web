/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff3eb',
          100: '#ffe4cc',
          200: '#ffc899',
          300: '#ffab66',
          400: '#ff8e33',
          500: '#ff6b00',
          600: '#e65c00',
          700: '#cc4e00',
          800: '#b34000',
          900: '#993300',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
