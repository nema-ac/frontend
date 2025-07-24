export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#000000',
        'cyber-cyan': '#00FFFF',
        'cyber-purple': '#9659D4',
        'cyber-light': '#EDEDED',
      },
      fontFamily: {
        'mono': ['Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
        'sans': ['Inter', 'Roboto', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
}
