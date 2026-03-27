// PostCSS configuration for Tailwind CSS v4.
// Tailwind v4 uses a PostCSS plugin instead of a CLI-first config file.
// No tailwind.config.js is needed — theme customisation is done in CSS
// using @theme { } blocks inside globals.css.

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
