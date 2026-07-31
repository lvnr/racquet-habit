import * as Sentry from "@sentry/astro";

declare const __SENTRY_RELEASE__: string;

Sentry.init({
  dsn: "https://bc79d15ac4f51d17971f8b596faeb64e@o4511829624553472.ingest.de.sentry.io/4511829654372432",
  environment: import.meta.env.PROD ? "production" : "development",
  release: __SENTRY_RELEASE__,
  sendDefaultPii: false,
  enableLogs: true,
  sampleRate: 1,
  tracesSampler: ({ name }) => name.includes("checkout") || name.includes("webhooks/fourthwall") ? 1 : 0.1,
  beforeSend(event) {
    if (event.request?.url) {
      const url = new URL(event.request.url, "https://racquethabit.com");
      url.search = "";
      event.request.url = url.toString();
    }
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
      delete event.request.data;
    }
    delete event.user;
    return event;
  },
});
