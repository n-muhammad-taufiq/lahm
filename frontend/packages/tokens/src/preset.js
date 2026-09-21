const tokens = require('./tokens.json');

const parsePixels = (obj) => {
  const result = {};
  for (const [k, v] of Object.entries(obj || {})) {
    result[k] = typeof v === 'string' && v.endsWith('px') ? parseInt(v, 10) : v;
  }
  return result;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: parsePixels(tokens.borderRadius),
      spacing: parsePixels(tokens.spacing),
      fontSize: tokens.fontSize,
      maxWidth: {
        card: 440,
        content: 800,
      },
      fontFamily: tokens.fontFamily,
    },
  },
};
