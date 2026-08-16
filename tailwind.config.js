/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
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
          900: "#0C0F0F",
          800: "#121414",
          700: "#1A1C1C",
          600: "#1E2020",
          500: "#282A2B",
          400: "#333535",
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
