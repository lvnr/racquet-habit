import * as Sentry from "@sentry/astro";

declare const __SENTRY_RELEASE__: string;

const scrubEvent = <T extends { request?: { url?: string; headers?: Record<string, string>; cookies?: unknown; data?: unknown }; user?: unknown }>(event: T) => {
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
};

Sentry.init({
  dsn: "https://bc79d15ac4f51d17971f8b596faeb64e@o4511829624553472.ingest.de.sentry.io/4511829654372432",
  environment: import.meta.env.PROD ? "production" : "development",
  release: __SENTRY_RELEASE__,
  sendDefaultPii: false,
  sampleRate: 1,
  tracesSampler: ({ name }) => name.includes("checkout") ? 1 : 0.1,
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubEvent,
});

type CheckoutContext = Record<string, string | number | boolean | undefined>;

globalThis.RacquetHabitObservability = {
  setCheckoutAttempt(attemptId: string) {
    Sentry.setTag("checkout.attempt_id", attemptId);
  },
  captureCheckoutError(error: unknown, context: CheckoutContext = {}) {
    Sentry.withScope((scope) => {
      scope.setTag("checkout.stage", String(context.stage || "unknown"));
      if (context.attemptId) scope.setTag("checkout.attempt_id", String(context.attemptId));
      scope.setContext("checkout", context);
      Sentry.captureException(error);
    });
  },
};
