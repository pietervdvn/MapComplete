import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import fs from "fs"

const allHtmlFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"))
const input = {}
const ASSET_URL = process.env.ASSET_URL || ""

for (const html of allHtmlFiles) {
  const name = html.substring(0, html.length - 5)
  input[name] = "./" + html
}

export default defineConfig({
  build: {
    rollupOptions: {
      input,
    },
  },
  base: `${ASSET_URL}`,
  plugins: [svelte()],
  server: {
    port: 1234,
  },
})
