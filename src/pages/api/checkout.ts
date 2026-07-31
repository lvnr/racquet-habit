import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import * as Sentry from "@sentry/astro";
import {
  checkoutAttemptPattern,
  logCheckout,
  observabilityDb,
  recordCheckoutAttempt,
  recordCheckoutEvent,
} from "../../lib/commerce-observability";

const checkoutDomain = "checkout.racquethabit.com";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedAttribution = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "_ga",
  "_fbp",
  "_fbc",
  "FPID",
  "ttclid",
  "epik",
] as const;

type CheckoutItem = { variantId?: unknown; quantity?: unknown };

export const POST: APIRoute = async ({ request }) => {
  const startedAt = Date.now();
  const runtimeEnv = env as unknown as Record<string, unknown>;
  const storefrontToken = runtimeEnv.FOURTHWALL_STOREFRONT_TOKEN as string | undefined;
  const db = observabilityDb(runtimeEnv);
  if (!storefrontToken) {
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 503 });
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin) {
    const origin = new URL(requestOrigin);
    const allowed = origin.hostname === "racquethabit.com"
      || origin.hostname === "www.racquethabit.com"
      || origin.hostname === "localhost"
      || origin.hostname === "127.0.0.1";
    if (!allowed) return Response.json({ error: "Invalid origin." }, { status: 403 });
  }

  let input: {
    items?: CheckoutItem[];
    consent?: { analytics?: unknown; marketing?: unknown };
    attribution?: Record<string, unknown>;
    identifiers?: Record<string, unknown>;
    sessionId?: unknown;
    checkoutAttemptId?: unknown;
    cartValue?: unknown;
    synthetic?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const items = (Array.isArray(input.items) ? input.items : [])
    .slice(0, 20)
    .map((item) => ({
      variantId: String(item.variantId || ""),
      quantity: Math.min(20, Math.max(1, Math.floor(Number(item.quantity) || 1))),
    }))
    .filter((item) => uuid.test(item.variantId));

  if (!items.length) return Response.json({ error: "Your bag is empty." }, { status: 400 });

  const requestedAttemptId = String(input.checkoutAttemptId || "");
  // Generate an ID for an older cached storefront script rather than blocking checkout.
  const checkoutAttemptId = checkoutAttemptPattern.test(requestedAttemptId)
    ? requestedAttemptId
    : crypto.randomUUID();
  const syntheticSecret = String(runtimeEnv.SYNTHETIC_CANARY_SECRET || "");
  const synthetic = input.synthetic === true
    && Boolean(syntheticSecret)
    && request.headers.get("x-rh-synthetic-key") === syntheticSecret;

  const attribution = input.attribution && typeof input.attribution === "object"
    ? input.attribution
    : {};
  const metadata = {
    rh_marketing_consent: input.consent?.marketing === true ? "granted" : "denied",
    rh_analytics_consent: input.consent?.analytics === true ? "granted" : "denied",
    rh_session_id: String(input.sessionId || "").slice(0, 128),
    rh_checkout_attempt_id: checkoutAttemptId,
    rh_synthetic: synthetic ? "true" : "false",
    utm_source: String(attribution.utm_source || "").slice(0, 256),
    utm_medium: String(attribution.utm_medium || "").slice(0, 256),
    utm_campaign: String(attribution.utm_campaign || "").slice(0, 256),
    utm_id: String(attribution.utm_id || "").slice(0, 256),
    utm_content: String(attribution.utm_content || "").slice(0, 256),
    utm_term: String(attribution.utm_term || "").slice(0, 256),
    epik: String(attribution.epik || "").slice(0, 256),
    ttclid: String(attribution.ttclid || "").slice(0, 256),
    ga_client_id: String(input.identifiers?.ga_client_id || "").slice(0, 256),
    ga_session_id: String(input.identifiers?.ga_session_id || "").slice(0, 256),
    ttp: String(input.identifiers?.ttp || "").slice(0, 256),
  };

  try {
    await recordCheckoutAttempt(db, {
      attemptId: checkoutAttemptId,
      sessionId: input.sessionId,
      status: "checkout_api_started",
      synthetic,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      amountUsd: Number(input.cartValue),
      source: attribution.utm_source,
      medium: attribution.utm_medium,
      campaign: attribution.utm_campaign,
    });
  } catch (error) {
    logCheckout("warn", { message: "Checkout observability write failed", attemptId: checkoutAttemptId, error: error instanceof Error ? error.message : "unknown" });
  }

  let cartResponse: Response;
  try {
    cartResponse = await fetch(
      `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${encodeURIComponent(storefrontToken)}&currency=USD`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, metadata }),
      },
    );
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("checkout.attempt_id", checkoutAttemptId);
      scope.setTag("checkout.stage", "fourthwall_cart_create");
      Sentry.captureException(error);
    });
    logCheckout("error", { message: "Fourthwall cart request failed", attemptId: checkoutAttemptId, durationMs: Date.now() - startedAt });
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });
  }

  if (!cartResponse.ok) {
    const error = new Error(`Fourthwall cart creation failed: ${cartResponse.status}`);
    Sentry.withScope((scope) => {
      scope.setTag("checkout.attempt_id", checkoutAttemptId);
      scope.setTag("checkout.stage", "fourthwall_cart_create");
      scope.setExtra("status", cartResponse.status);
      Sentry.captureException(error);
    });
    try {
      await recordCheckoutEvent(db, { attemptId: checkoutAttemptId, eventName: "checkout_api_error", statusCode: cartResponse.status, durationMs: Date.now() - startedAt, synthetic });
    } catch {}
    logCheckout("error", { message: "Fourthwall cart creation failed", attemptId: checkoutAttemptId, status: cartResponse.status, durationMs: Date.now() - startedAt });
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });
  }

  const cart = await cartResponse.json() as { id?: string };
  if (!cart.id) return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });

  const checkout = new URL(`https://${checkoutDomain}/cart/checkout`);
  checkout.searchParams.set("cartId", cart.id);
  checkout.searchParams.set("currency", "USD");
  checkout.searchParams.set("cart_origin", "https://racquethabit.com");

  const identifiers = input.identifiers && typeof input.identifiers === "object"
    ? input.identifiers
    : {};
  for (const key of allowedAttribution) {
    const value = identifiers[key] ?? attribution[key];
    if (typeof value === "string" && value) checkout.searchParams.set(key, value.slice(0, 500));
  }

  try {
    await recordCheckoutAttempt(db, {
      attemptId: checkoutAttemptId,
      status: "checkout_created",
      synthetic,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      amountUsd: Number(input.cartValue),
      upstreamStatus: cartResponse.status,
      checkoutHost: checkout.hostname,
    });
    await recordCheckoutEvent(db, {
      attemptId: checkoutAttemptId,
      eventName: "checkout_api_success",
      statusCode: cartResponse.status,
      durationMs: Date.now() - startedAt,
      synthetic,
    });
  } catch (error) {
    logCheckout("warn", { message: "Checkout success telemetry write failed", attemptId: checkoutAttemptId, error: error instanceof Error ? error.message : "unknown" });
  }
  logCheckout("info", { message: "Checkout created", attemptId: checkoutAttemptId, synthetic, itemCount: items.length, durationMs: Date.now() - startedAt });

  return Response.json(
    { url: checkout.toString(), checkoutAttemptId },
    { headers: { "Cache-Control": "no-store" } },
  );
};
