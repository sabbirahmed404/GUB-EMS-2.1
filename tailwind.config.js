/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5465ff',
        secondary: '#788bff',
        accent: '#9bb1ff',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #5465ff 0%, #788bff 50%, #9bb1ff 100%)',
      },
    },
  },
  plugins: [],
};