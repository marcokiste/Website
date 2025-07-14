/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'scanline': 'scanline 4s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.9' },
          '15%': { opacity: '0.85' },
          '20%': { opacity: '0.95' },
          '25%': { opacity: '0.85' },
          '30%': { opacity: '0.9' },
          '35%': { opacity: '0.95' },
          '40%': { opacity: '0.85' },
          '45%': { opacity: '0.9' },
          '50%': { opacity: '0.95' },
          '55%': { opacity: '0.85' },
          '60%': { opacity: '0.9' },
          '65%': { opacity: '0.95' },
          '70%': { opacity: '0.9' },
          '75%': { opacity: '0.85' },
          '80%': { opacity: '0.9' },
          '85%': { opacity: '0.95' },
          '90%': { opacity: '0.9' },
          '95%': { opacity: '0.95' },
          '100%': { opacity: '0.97' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      }
    },
  },
  plugins: [],
} 