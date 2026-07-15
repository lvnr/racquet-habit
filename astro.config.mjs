// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://racquethabit.com",
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [sitemap()],
  vite: {
    build: {
      minify: false,
    },
  },
});
