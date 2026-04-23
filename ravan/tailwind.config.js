/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00f0ff',
        'primary-dark': '#008cff',
        'site-bg': '#0a0a1a',
        'card-bg': 'rgba(10, 10, 30, 0.85)',
        'text-light': '#b0b0ff',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(0, 240, 255, 0.7)',
        'glow-lg': '0 0 30px rgba(0, 240, 255, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
