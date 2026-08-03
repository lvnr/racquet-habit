type ClientEvent = {
  message?: string;
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
    }>;
  };
};

const browserViewTransitionNoise = new Set([
  "Skipping view transition because skipTransition() was called.",
  "Skipping view transition because viewport size changed.",
  "AbortError: Transition was skipped",
]);

const isInjectedMobileBridgeNoise = (value: string) =>
  value.includes("window.webkit.messageHandlers")
  || value === "Error invoking postMessage: Java object is gone";

export const isKnownBrowserNoise = (event: ClientEvent) => {
  const messages = [
    event.message,
    ...(event.exception?.values || []).flatMap(({ type, value }) => [
      value,
      type && value ? `${type}: ${value}` : undefined,
    ]),
  ].filter((value): value is string => Boolean(value));

  return messages.some((value) =>
    browserViewTransitionNoise.has(value) || isInjectedMobileBridgeNoise(value)
  );
};
