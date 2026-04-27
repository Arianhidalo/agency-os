/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          steel: '#3f647e',
          crimson: '#7a1f2d',
          gold: '#8a7443'
        }
      }
    }
  },
  plugins: [],
};
