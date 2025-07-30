export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#000000',
        'cyber-cyan': '#00FFFF',
        'cyber-purple': '#9659D4',
        'cyber-light': '#EDEDED',
        'nema-cyan': '#22d3ee',
        'nema-purple': '#a855f7',
        'nema-orange': '#fb923c',
        'nema-green': '#22c55e',
        'nema-gray-300': '#d1d5db',
        'nema-gray-400': '#9ca3af',
        'nema-gray-500': '#6b7280',
        'nema-gray-700': '#374151',
        'nema-white': '#ffffff',
        'nema-black': '#000000',
      },
      fontFamily: {
        'mono': ['Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
        'sans': ['Inter', 'Roboto', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
}
