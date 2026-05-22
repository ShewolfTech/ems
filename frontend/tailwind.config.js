/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensures Tailwind scans all your components
  ],
  theme: {
    extend: {
      fontFamily: {
        // Map 'font-gill' to Gill Sans family
        gill: ['"Gill Sans"', '"Gill Sans MT"', 'Calibri', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        pulseLogo: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.9 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
        pulseLogo: 'pulseLogo 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
