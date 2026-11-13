/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F6F3',
          100: '#DCECE3',
          200: '#BCDACB',
          300: '#95C2AE',
          400: '#529778',
          500: '#184E3A', // Deep civic emerald
          600: '#133F2F',
          700: '#0E2F23',
          800: '#0A2018',
          900: '#05110D',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FAECE4',
          200: '#F4D4C4',
          300: '#EBB49C',
          400: '#E28E6E',
          500: '#D96B43', // Warm restrained accent
          600: '#C35B34',
          700: '#9E4523',
          800: '#7A351B',
          900: '#572613',
        },
        sand: {
          50: '#FAF7F2', // Editorial warm off-white
          100: '#F4EFE6',
          200: '#E7DFCE',
          300: '#D7CBB3',
          400: '#B8A88A',
          500: '#8E7D5D',
          600: '#68593F',
          700: '#4A3E2A',
          800: '#2F2618',
          900: '#181209',
        },
        charcoal: {
          50: '#F6F6F7',
          100: '#E1E2E5',
          200: '#C4C6CB',
          300: '#9FA2AA',
          400: '#737782',
          500: '#525661',
          600: '#3C4049',
          700: '#2A2D34',
          800: '#1B1D22',
          900: '#121316', // Deep warm charcoal
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Instrument Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
