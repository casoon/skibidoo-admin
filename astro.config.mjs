import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    tailwind(),
    alpinejs({
      entrypoint: "/src/lib/alpine.ts",
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
