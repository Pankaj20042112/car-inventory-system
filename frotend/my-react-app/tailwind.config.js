/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',      // Deep premium dark background
        cardBg: '#151c2c',      // Dark slate card
        brandPrimary: '#6366f1', // Indigo primary
        brandSecondary: '#a855f7', // Purple secondary
      },
      boxShadow: {
        glow: '0 0 15px rgba(168, 85, 247, 0.4)',
      }
    },
  },
  plugins: [],
}
