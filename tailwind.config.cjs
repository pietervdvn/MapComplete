/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin")

module.exports = {
  content: ["./**/*.{html,ts,svelte}"],
  theme: {
    extend: {
      maxHeight: {
        "65vh": "65vh",
        "20vh": "20vh",
      },
      colors: {
        subtle: "#dbeafe",
        unsubtle: "#bfdbfe",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant, e }) {
      addVariant("landscape", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`landscape${separator}${className}`)}:landscape`
        })
      })
    }),
  ],
}
