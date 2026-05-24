// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'), // <-- ESTO es lo correcto
    require('autoprefixer'),
  ],
};