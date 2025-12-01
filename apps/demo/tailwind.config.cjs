const { themeColors } = require('./lib/theme.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ...themeColors,
      },
    },
  },
  plugins: [],
};
