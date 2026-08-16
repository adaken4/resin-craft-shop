/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        amber: {
          400: "#FFBF00",
          500: "#FFBF00",
          600: "#E6AC00",
          glow: "rgba(255, 191, 0, 0.25)",
        },
        obsidian: {
          950: "#080A0A",
          900: "#0C0F0F",
          850: "#101213",
          800: "#141718",
          750: "#181C1D",
          700: "#1E2223",
          600: "#242A2C",
          500: "#2F3639",
          400: "#3E464A",
        },
        surface: {
          DEFAULT: "#121414",
          low: "#1A1C1C",
          container: "#1E2020",
          high: "#282A2B",
          highest: "#333535",
          bright: "#38393A",
        },
        text: {
          primary: "#E2E2E2",
          secondary: "#D4C5AB",
          muted: "#9C8F78",
        }
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        headline: ["Manrope", "sans-serif"],
        label: ["Hanken Grotesk", "sans-serif"],
      },
      boxShadow: {
        resin: "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px 0 rgba(255, 191, 0, 0.15)",
        "resin-lg": "0 20px 40px -10px rgba(0, 0, 0, 0.9), 0 0 30px 2px rgba(255, 191, 0, 0.25)",
        "amber-glow": "0 0 15px rgba(255, 191, 0, 0.4)",
      },
      borderRadius: {
        "4xl": "2rem",
      }
    },
  },
  plugins: [],
}
