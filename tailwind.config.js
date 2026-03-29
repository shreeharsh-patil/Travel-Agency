/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        'brand-gold': '#d4af37',
        'travel-gold': '#D4AF37',
        'travel-ocean': '#0A4D68',
        'travel-teal': '#088395',
        'travel-white': '#FEFEFE',
        'travel-orange': '#FF6B35',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 10s linear infinite',
        'bubble-rise': 'bubbleRise 4s ease-in infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(20px)' },
        },
        bubbleRise: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-20%)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
