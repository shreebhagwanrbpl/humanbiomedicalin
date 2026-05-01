/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4B2E2E",
        secondary: "#FFF8E7",
        accent: "#D9A066",
      },
    },
  },
  plugins: [],
};