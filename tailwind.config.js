module.exports = {
  purge: [
    // './**/*.html',
    // './**/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      // This does not work and I don't know why.
      // Luckily index.css "@layer utilities" has the same effekt.
      // maxHeight: {
      //   '65vh': '65vh',
      // },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
