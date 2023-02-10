import { defineConfig } from "vitest/config"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import autoPreprocess from "svelte-preprocess"
export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST, preprocess: [autoPreprocess()] })],
    test: {
        globals: true,
        setupFiles: ["./test/testhooks.ts"],
        include: ["./test", "./*.doctest.ts", "./**/*.doctest.ts"],
    },
})
