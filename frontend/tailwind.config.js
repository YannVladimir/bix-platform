/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bix: {
          navy: "rgb(var(--bix-navy) / <alpha-value>)",
          sky: "rgb(var(--bix-sky) / <alpha-value>)",
          teal: "rgb(var(--bix-teal) / <alpha-value>)",
          lime: "rgb(var(--bix-lime) / <alpha-value>)",
          surface: "rgb(var(--bix-surface) / <alpha-value>)",
          slate: "rgb(var(--bix-slate) / <alpha-value>)",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
