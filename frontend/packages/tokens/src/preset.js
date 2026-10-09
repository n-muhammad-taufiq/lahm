const tokens = require('./tokens.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.borderRadius,
      spacing: tokens.spacing,
      fontSize: tokens.fontSize,
      maxWidth: {
        card: tokens.layout.cardMaxWidth,
        content: tokens.layout.maxContentWidth,
      },
      fontFamily: tokens.fontFamily,
    },
  },
};
