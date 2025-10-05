/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shake: 'shake 0.5s ease-in-out infinite',
        'pop-in': 'popIn 0.5s ease-out forwards',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px) translateY(-3px) rotate(-1deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px) translateY(3px) rotate(1deg)' },
        },
        popIn: {
          '0%': { 
            transform: 'scale(0) translate(100px, 100px)',
            opacity: '0',
          },
          '70%': { 
            transform: 'scale(1.1) translate(0, 0)',
          },
          '100%': { 
            transform: 'scale(1) translate(0, 0)',
            opacity: '1',
          },
        }
      }
    },
  },
  plugins: [],
}