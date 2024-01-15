import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import fs from "fs"
import basicSsl from '@vitejs/plugin-basic-ssl'

const allHtmlFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"))
const input = {}
const ASSET_URL = process.env.ASSET_URL || ""

for (const html of allHtmlFiles) {
  const name = html.substring(0, html.length - 5)
  input[name] = "./" + html
}
console.log("Args:",process.argv)
const plugins = [svelte() ]
if(process.argv.indexOf("--https") >= 0){
  console.log("Adding basicSSL")
  plugins.push(basicSsl())
}
export default defineConfig({
  build: {
    rollupOptions: {
      input,
    },
  },
  base: `${ASSET_URL}`,
  plugins ,
  server: {
    port: 1234,
  },
})
