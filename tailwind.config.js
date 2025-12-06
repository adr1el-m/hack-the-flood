/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': '#1e3a8a', // Dark Royal Blue
        'gov-blue-light': '#3b82f6',
        'gov-accent': '#f59e0b', // Amber/Gold
        'gov-bg': '#f8fafc', // Slate 50
        'gov-text': '#1e293b', // Slate 800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}