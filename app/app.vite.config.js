import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import basicSsl from "@vitejs/plugin-basic-ssl"

const input = {
  land: "./app/land.html",
  index: "./app/index.html",
  passthrough: "./app/passthrough.html"
}


console.log("Args:", process.argv)
const plugins = [svelte()]
if (process.argv.indexOf("--https") >= 0) {
  console.log("Adding basicSSL")
  plugins.push(basicSsl())
}
const ASSET_URL = process.env.ASSET_URL || ""
export default defineConfig({
  build: {
    rollupOptions: {
      input,
    },
    outDir: "./app/dist/",
  },
  base: `./app/`,
  plugins,
  server: {
    port: 1234,
  },
})
