export default {
  darkMode: 'class', // ⬅️ Tambahkan ini di sini
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      animation: {
        // scan: "scanAnim 2s linear infinite",
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        scanAnim: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
        netflix: ['Montserrat', 'sans-serif'],
      },

    },
  },
  plugins: [],
}
