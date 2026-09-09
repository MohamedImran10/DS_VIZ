/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 16px 40px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(circle at top left, rgba(255,183,77,0.25), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.22), transparent 26%), linear-gradient(180deg, rgba(9,12,24,0.96), rgba(7,10,18,1))',
      },
    },
  },
  plugins: [],
};