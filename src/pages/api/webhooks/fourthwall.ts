import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  buildGa4Payload,
  buildPinterestPayload,
  buildTikTokPayload,
  type FourthwallEvent,
} from "../../../lib/fourthwall-conversions";

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

const sendPinterestCheckout = async (
  event: FourthwallEvent,
  accessToken: string,
  adAccountId: string,
) => {
  const payload = await buildPinterestPayload(event);
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
    console.error(JSON.stringify({
      message: "Pinterest rejected Fourthwall purchase",
      status: response.status,
      error: error.slice(0, 500),
      eventId: event.id,
    }));
    throw new Error(`Pinterest conversion failed: ${response.status}`);
  }
  return { sent: true };
};

const sendGa4Purchase = async (
  event: FourthwallEvent,
  measurementId: string,
  apiSecret: string,
) => {
  const payload = await buildGa4Payload(event);
  const endpoint = new URL(event.testMode
    ? "https://www.google-analytics.com/debug/mp/collect"
    : "https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event.testMode
      ? { ...payload, validation_behavior: "ENFORCE_RECOMMENDATIONS" }
      : payload),
  });
  const validation = event.testMode
    ? await response.json() as { validationMessages?: Array<{ description?: string }> }
    : null;
  if (!response.ok || validation?.validationMessages?.length) {
    console.error(JSON.stringify({
      message: "GA4 rejected Fourthwall purchase",
      status: response.status,
      validationMessages: validation?.validationMessages || [],
      eventId: event.id,
    }));
    throw new Error(`GA4 conversion failed: ${response.status}`);
  }
  return { sent: !event.testMode, validated: Boolean(event.testMode) };
};

const sendTikTokPurchase = async (
  event: FourthwallEvent,
  pixelCode: string,
  accessToken: string,
  testEventCode?: string,
) => {
  if (event.testMode && !testEventCode) return { skipped: "missing_test_event_code" };
  const payload = await buildTikTokPayload(event, pixelCode, event.testMode ? testEventCode : undefined);
  const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
    method: "POST",
    headers: {
      "Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json() as { code?: number; message?: string; request_id?: string };
  if (!response.ok || result.code !== 0) {
    console.error(JSON.stringify({
      message: "TikTok rejected Fourthwall purchase",
      status: response.status,
      code: result.code,
      error: result.message,
      requestId: result.request_id,
      eventId: event.id,
    }));
    throw new Error(`TikTok conversion failed: ${response.status}/${result.code ?? "unknown"}`);
  }
  return { sent: !event.testMode, tested: Boolean(event.testMode), requestId: result.request_id };
};

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const webhookSecret = runtimeEnv.FOURTHWALL_WEBHOOK_SECRET;
  const pinterestToken = runtimeEnv.PINTEREST_ACCESS_TOKEN;
  const pinterestAdAccountId = runtimeEnv.PINTEREST_AD_ACCOUNT_ID || "549770622978";
  const gaMeasurementId = runtimeEnv.GA_MEASUREMENT_ID || "G-B53YGNVTNF";
  const gaApiSecret = runtimeEnv.GA4_API_SECRET;
  const tiktokPixelId = runtimeEnv.TIKTOK_PIXEL_ID || "D9HKESBC77U1LOVTV5E0";
  const tiktokAccessToken = runtimeEnv.TIKTOK_EVENTS_API_ACCESS_TOKEN;
  const tiktokTestEventCode = runtimeEnv.TIKTOK_TEST_EVENT_CODE;
  if (!webhookSecret || !pinterestToken || !gaApiSecret || !tiktokAccessToken) {
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

  const providers = await Promise.allSettled([
    sendPinterestCheckout(event, pinterestToken, pinterestAdAccountId),
    sendGa4Purchase(event, gaMeasurementId, gaApiSecret),
    sendTikTokPurchase(event, tiktokPixelId, tiktokAccessToken, tiktokTestEventCode),
  ]);
  const [pinterest, ga4, tiktok] = providers.map((result) => result.status === "fulfilled"
    ? result.value
    : { error: result.reason instanceof Error ? result.reason.message : "delivery_failed" });
  const failed = providers.some((result) => result.status === "rejected");
  if (failed) {
    return Response.json({ error: "Conversion delivery failed." }, { status: 502 });
  }
  console.log(JSON.stringify({
    message: "Fourthwall purchase delivered",
    eventId: event.id,
    orderId: event.data?.id,
    testMode: Boolean(event.testMode),
    providers: { pinterest, ga4, tiktok },
  }));
  return Response.json({ received: true, pinterest, ga4, tiktok });
};
