/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bfab: {
          50: '#faf7ff',
          100: '#f2ebff',
          200: '#e4d3ff',
          300: '#ceb0ff',
          400: '#b181ff',
          500: '#9747ff',
          600: '#7e22ce',
          700: '#6b21a8',
          800: '#581c87',
          900: '#3b0764',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(126, 34, 206, 0.18)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        cardHover: '0 20px 50px -12px rgba(126, 34, 206, 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        shimmer: 'shimmer 3s linear infinite',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(1200px 600px at 20% 0%, rgba(126,34,206,0.18), transparent 60%), radial-gradient(800px 500px at 100% 100%, rgba(167,85,247,0.15), transparent 60%)',
      },
    },
  },
  plugins: [],
};
