/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uasz: { 950: '#102f29', 900: '#123d32', 700: '#1c654a', 100: '#e6f1eb' },
        sand: { 50: '#faf8f2', 100: '#f1ecdf' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
