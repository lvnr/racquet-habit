// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://racquethabit.com",
  output: "server",
  trailingSlash: "never",
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404") && !page.endsWith("/newsletter-confirmed"),
      customSitemaps: ["https://racquethabit.com/sitemap-products.xml"],
    }),
  ],
  vite: {
    build: {
      minify: false,
    },
  },
});
