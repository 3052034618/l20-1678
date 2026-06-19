/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        coral: {
          50: '#FFF1EC',
          100: '#FFE0D5',
          200: '#FFC4AD',
          300: '#FFA885',
          400: '#FF8C69',
          500: '#FF7A4F',
          600: '#F56537',
          700: '#E04F1F',
          800: '#C43E12',
          900: '#A0310D',
        },
        peach: {
          50: '#FFF8F0',
          100: '#FFEFDC',
          200: '#FFDFB8',
          300: '#FFCF94',
          400: '#FFBF70',
          500: '#FFAF4C',
          600: '#F59A28',
          700: '#D67F10',
          800: '#AD660A',
          900: '#854D06',
        },
        mint: {
          50: '#F0F9F6',
          100: '#DBF3EB',
          200: '#B7E7D7',
          300: '#93DBC3',
          400: '#6FCFAF',
          500: '#4BC39B',
          600: '#3AAA82',
          700: '#2C8868',
          800: '#1F664E',
          900: '#134434',
        },
        cream: {
          50: '#FFFCF7',
          100: '#FFF8EC',
          200: '#FFF0D4',
          300: '#FFE8BC',
          400: '#FFE0A4',
          500: '#FFD88C',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
};
