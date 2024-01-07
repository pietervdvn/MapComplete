import { defineConfig } from "vitest/config"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import autoPreprocess from "svelte-preprocess"
export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST, preprocess: [autoPreprocess()] })],
    test: {
        globals: true,
        maxThreads: 16,
        minThreads: 1,
        setupFiles: ["./test/testhooks.ts"],
        include: ["./test/*.spec.ts", "./test/**/*.spec.ts", "./*.doctest.ts", "./**/*.doctest.ts"],
    },
})
