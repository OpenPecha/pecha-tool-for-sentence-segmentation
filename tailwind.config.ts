import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js",
  ],
  theme: {
    extend: {},
    fontFamily: {
      Elsie: ["Elsie", "sans-serif"],
      Inter: ["Inter", "sans-serif"],
      monlam: ["Monlam", "sans-serif"],
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;
