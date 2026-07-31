import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  checkoutAttemptPattern,
  observabilityDb,
  recordCheckoutEvent,
} from "../../../lib/commerce-observability";

const allowedEvents = new Set([
  "checkout_click",
  "checkout_api_success",
  "checkout_api_error",
  "checkout_redirect",
  "checkout_fallback",
]);

export const POST: APIRoute = async ({ request }) => {
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }
  const attemptId = String(input.attemptId || "");
  const eventName = String(input.event || "");
  if (!checkoutAttemptPattern.test(attemptId) || !allowedEvents.has(eventName)) {
    return new Response(null, { status: 204 });
  }
  try {
    const runtimeEnv = env as unknown as Record<string, unknown>;
    await recordCheckoutEvent(observabilityDb(runtimeEnv), {
      attemptId,
      eventName,
      durationMs: Number(input.durationMs),
      statusCode: Number(input.statusCode),
      detail: input.detail,
    });
  } catch (error) {
    console.warn(JSON.stringify({ service: "commerce", message: "Checkout telemetry write failed", eventName, error: error instanceof Error ? error.message : "unknown" }));
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
};
