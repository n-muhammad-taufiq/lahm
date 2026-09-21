/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [
    require("nativewind/preset"),
    require("../../packages/tokens/src/preset.js"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

