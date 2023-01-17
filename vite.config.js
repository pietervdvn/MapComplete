const { defineConfig } = require("vite")
import fs from "fs"
const allHtmlFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"))
const input = {}
const ASSET_URL = process.env.ASSET_URL || ""

for (const html of allHtmlFiles) {
  const name = html.substring(0, html.length - 5)
  input[name] = "./" + html
}

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input,
    },
  },
  base: `${ASSET_URL}`,
  server: {
    port: 1234,
  },
})
