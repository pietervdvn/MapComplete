/** @type {import("tailwindcss").Config} */
const plugin = require("tailwindcss/plugin")

module.exports = {
  content: ["./**/*.{html,ts,svelte}", "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      maxHeight: {
        "65vh": "65vh",
        "20vh": "20vh"
      },
      colors: {
        // flowbite-svelte
        primary: {
          50: "#FFF5F2",
          100: "#FFF1EE",
          200: "#FFE4DE",
          300: "#FFD5CC",
          400: "#FFBCAD",
          500: "#FE795D",
          600: "#EF562F",
          700: "#EB4F27",
          800: "#CC4522",
          900: "#A5371B"
        }
      }
    }
  },
  plugins: [
   // require("flowbite/plugin"),
    plugin(function({ addVariant, e }) {
      addVariant("landscape", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`landscape${separator}${className}`)}:landscape`
        })
      })
    })
  ]
}
