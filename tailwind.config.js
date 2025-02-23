/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        blink: 'blink 1s step-end infinite',
        'fade-in': 'fade-in 1.5s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        nema: {
          // Sunset/dawn colors
          dawn: '#91C1E7',
          midday: '#B4A7D6',
          dusk: '#F4B8C4',
          // Sunset inspired colors
          sky: '#91C1E7',
          twilight: '#6C5B7B',
          // Warm accents
          sand: '#F9E4B7',
          glow: '#FFB6B9',
          // Base colors
          light: '#F7F3E9',
          dark: '#2C3338',
        },
      },
    },
  },
  plugins: [],
}
