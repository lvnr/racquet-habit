import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const checkoutDomain = "checkout.racquethabit.com";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedAttribution = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "_ga",
  "_fbp",
  "_fbc",
  "FPID",
] as const;

type CheckoutItem = { variantId?: unknown; quantity?: unknown };

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const storefrontToken = runtimeEnv.FOURTHWALL_STOREFRONT_TOKEN;
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

  const attribution = input.attribution && typeof input.attribution === "object"
    ? input.attribution
    : {};
  const metadata = {
    rh_marketing_consent: input.consent?.marketing === true ? "granted" : "denied",
    rh_analytics_consent: input.consent?.analytics === true ? "granted" : "denied",
    rh_session_id: String(input.sessionId || "").slice(0, 128),
    landing_page: String(attribution.landing_page || "").slice(0, 500),
    epik: String(attribution.epik || "").slice(0, 256),
    ttclid: String(attribution.ttclid || "").slice(0, 256),
  };

  const cartResponse = await fetch(
    `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${encodeURIComponent(storefrontToken)}&currency=USD`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, metadata }),
    },
  );

  if (!cartResponse.ok) {
    console.error("[checkout] Fourthwall cart creation failed", cartResponse.status);
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

  return Response.json(
    { url: checkout.toString() },
    { headers: { "Cache-Control": "no-store" } },
  );
};
