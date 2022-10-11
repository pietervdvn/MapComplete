/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./**/*.html", "./**/*.ts"],
  theme: {
    extend: {
      maxHeight: {
        "65vh": "65vh",
        "20vh": "20vh",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant, e }) {
      addVariant("landscape", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`landscape${separator}${className}`)}:landscape`;
        });
      });
    }),
  ],
};
