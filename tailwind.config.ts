import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'matrix': {
          'green': '#00ff00',
          'dark-green': '#003300',
          'light-green': '#39ff14',
          'black': '#000000',
          'darker': '#0a0a0a',
          'terminal': '#101010',
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        'matrix': ['VT323', 'monospace'],
        'code': ['Fira Code', 'monospace'],
      },
      animation: {
        'matrix-fade': 'fade 2s linear infinite',
        'terminal-blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fade: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
