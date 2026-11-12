import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// BASE_PATH is the URL path the site is served from, such as /experiments/icon-font-pair/. Defaults to the root.
const base = (process.env.BASE_PATH || "/").replace(/\/?$/, "/");

export default defineConfig({
  base,
  plugins: [svelte()],
  build: {
    target: "es2022",
    // the font catalog is its own chunk, so a code change doesn't bust its cache and the other way round
    rollupOptions: { output: { manualChunks: (id) => (id.includes("/src/generated/") ? "fonts" : id.includes("node_modules/@awesome.me/") ? "webawesome" : undefined) } },
  },
});
