// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";

const sentryRelease = process.env.SENTRY_RELEASE || process.env.CF_PAGES_COMMIT_SHA || "racquet-habit@local";

export default defineConfig({
  site: "https://racquethabit.com",
  output: "server",
  trailingSlash: "never",
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [
    sentry({
      org: "racquet-habit",
      project: "racquet-habit-storefront",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
      telemetry: false,
    }),
    sitemap({
      filter: (page) => !page.endsWith("/404") && !page.endsWith("/newsletter-confirmed"),
      customSitemaps: ["https://racquethabit.com/sitemap-products.xml"],
    }),
  ],
  vite: {
    define: {
      __SENTRY_RELEASE__: JSON.stringify(sentryRelease),
    },
    build: {
      minify: false,
    },
  },
});
