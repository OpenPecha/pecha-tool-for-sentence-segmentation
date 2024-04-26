import type { Config } from "tailwindcss";
import flowbite from "flowbite-react/tailwind";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js",
    flowbite.content(),
  ],
  theme: {
    extend: {},
    fontFamily: {
      Elsie: ["Elsie", "sans-serif"],
      Inter: ["Inter", "sans-serif"],
      monlam: ["Monlam", "sans-serif"],
    },
  },
  plugins: [require("daisyui"), flowbite.plugin()],
} satisfies Config;
