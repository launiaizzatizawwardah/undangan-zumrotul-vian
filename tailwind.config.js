export default {
  darkMode: 'class', // ⬅️ Tambahkan ini di sini
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      },

    },
  },
  plugins: [],
}
