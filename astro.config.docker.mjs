/**
 * Astro config for Docker/Node.js deployment.
 * Primary deployment target is Cloudflare (astro.config.mjs).
 * This config is used by the Dockerfile for self-hosted/local Docker builds.
 */
import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    alpinejs({ entrypoint: "/src/lib/alpine.ts" }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": "/src" } },
    build: { minify: "esbuild", target: "es2022" },
  },
});
