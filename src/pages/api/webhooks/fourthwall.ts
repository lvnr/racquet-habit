import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const encoder = new TextEncoder();

const toBase64 = (bytes: ArrayBuffer) => {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
};

const verifySignature = async (body: ArrayBuffer, signature: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, body);
  return safeEqual(toBase64(digest), signature);
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value.trim().toLowerCase()));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

type Money = { value?: number; currency?: string };
type FourthwallOrder = {
  id?: string;
  friendlyId?: string;
  email?: string;
  createdAt?: string;
  amounts?: { subtotal?: Money };
  metadata?: Record<string, unknown>;
  offers?: Array<{
    id?: string;
    name?: string;
    variant?: {
      id?: string;
      name?: string;
      quantity?: number;
      unitPrice?: Money;
    };
  }>;
};

type FourthwallEvent = {
  id?: string;
  type?: string;
  testMode?: boolean;
  createdAt?: string;
  data?: FourthwallOrder;
};

const sendPinterestCheckout = async (
  event: FourthwallEvent,
  accessToken: string,
  adAccountId: string,
) => {
  const order = event.data || {};
  const metadata = order.metadata || {};
  if (metadata.rh_marketing_consent !== "granted") return { skipped: "marketing_consent" };
  if (!order.email) return { skipped: "missing_user_data" };

  const subtotal = order.amounts?.subtotal;
  const contents = (order.offers || []).map((offer) => ({
    id: offer.variant?.id || offer.id || "",
    item_name: offer.name || offer.variant?.name || "",
    item_price: String(offer.variant?.unitPrice?.value || 0),
    quantity: Number(offer.variant?.quantity || 1),
  }));
  const numItems = contents.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = order.createdAt || event.createdAt;
  const eventTime = createdAt ? Math.floor(new Date(createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const eventSource = new URL("https://racquethabit.com/order-confirmed");
  const epik = String(metadata.epik || "");
  if (epik) eventSource.searchParams.set("epik", epik);

  const userData: { em: string[]; click_id?: string } = {
    em: [await sha256(order.email)],
  };
  if (epik) userData.click_id = epik;

  const payload = {
    data: [{
      event_name: "checkout",
      action_source: "web",
      event_time: eventTime,
      event_id: `fourthwall:${order.id || event.id || order.friendlyId}`,
      event_source_url: eventSource.toString(),
      opt_out: false,
      user_data: userData,
      custom_data: {
        currency: subtotal?.currency || "USD",
        value: String(subtotal?.value || 0),
        order_id: order.id || order.friendlyId || "",
        num_items: numItems,
        contents,
      },
    }],
  };

  const endpoint = new URL(`https://api.pinterest.com/v5/ad_accounts/${encodeURIComponent(adAccountId)}/events`);
  if (event.testMode) endpoint.searchParams.set("test", "true");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.text();
    console.error("[fourthwall-webhook] Pinterest rejected checkout", response.status, error.slice(0, 500));
    throw new Error(`Pinterest conversion failed: ${response.status}`);
  }
  return { sent: true };
};

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const webhookSecret = runtimeEnv.FOURTHWALL_WEBHOOK_SECRET;
  const pinterestToken = runtimeEnv.PINTEREST_ACCESS_TOKEN;
  const pinterestAdAccountId = runtimeEnv.PINTEREST_AD_ACCOUNT_ID || "549770622978";
  if (!webhookSecret || !pinterestToken) {
    return Response.json({ error: "Webhook integration is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("X-Fourthwall-Hmac-SHA256") || "";
  const rawBody = await request.arrayBuffer();
  if (!signature || !await verifySignature(rawBody, signature, webhookSecret)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: FourthwallEvent;
  try {
    event = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.type !== "ORDER_PLACED") {
    return Response.json({ received: true, ignored: event.type || "unknown" });
  }

  try {
    const pinterest = await sendPinterestCheckout(event, pinterestToken, pinterestAdAccountId);
    return Response.json({ received: true, pinterest });
  } catch {
    return Response.json({ error: "Conversion delivery failed." }, { status: 502 });
  }
};
