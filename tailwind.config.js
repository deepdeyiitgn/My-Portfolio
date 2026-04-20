/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Black/Zinc background
        dark: "#09090b", // zinc-950
        // Amber highlights
        primary: {
          DEFAULT: "#f59e0b", // amber-500
          hover: "#fbbf24",   // amber-400
        },
        // Component specific colors
        card: {
          DEFAULT: "#18181b", // zinc-900
          hover: "#27272a",   // zinc-800
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
