import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.hostname === "www.racquethabit.com") {
    const destination = new URL(context.url);
    destination.hostname = "racquethabit.com";
    return context.redirect(destination.toString(), 301);
  }
  return next();
});
