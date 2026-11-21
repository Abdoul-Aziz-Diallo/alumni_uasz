/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uasz: {
          950: '#102f29',
          900: '#123d32',
          800: '#164d3c',
          700: '#1c654a',
          600: '#287a58',
          500: '#329b79',
          300: '#94cbb0',
          200: '#c5e3d4',
          100: '#e6f1eb',
          50: '#f4faf6',
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
