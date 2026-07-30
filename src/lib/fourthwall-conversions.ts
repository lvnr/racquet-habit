const encoder = new TextEncoder();

export type Money = {
  value?: number;
  currency?: string;
};

export type FourthwallAddress = {
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
};

export type FourthwallOrder = {
  id?: string;
  friendlyId?: string;
  email?: string;
  createdAt?: string;
  promotionId?: string;
  amounts?: {
    subtotal?: Money;
    shipping?: Money;
    tax?: Money;
    total?: Money;
  };
  billing?: FourthwallAddress;
  shipping?: FourthwallAddress;
  metadata?: Record<string, unknown>;
  trackingParams?: Record<string, unknown>;
  offers?: Array<{
    id?: string;
    name?: string;
    variant?: {
      id?: string;
      name?: string;
      sku?: string;
      quantity?: number;
      unitPrice?: Money;
      price?: Money;
    };
  }>;
};

export type FourthwallEvent = {
  id?: string;
  type?: string;
  testMode?: boolean;
  createdAt?: string;
  data?: FourthwallOrder;
};

type ConversionItem = {
  id: string;
  name: string;
  variant: string;
  sku: string;
  price: number;
  quantity: number;
};

const text = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const normalizedEmail = (value: string) => value.trim().toLowerCase();
const normalizedPhone = (value: string) => value.trim().replace(/[^\d+]/g, "");

const orderKey = (event: FourthwallEvent) => {
  const order = event.data || {};
  return text(order.id) || text(order.friendlyId) || text(event.id);
};

const orderTime = (event: FourthwallEvent) => {
  const value = event.data?.createdAt || event.createdAt;
  const timestamp = value ? new Date(value).getTime() : Date.now();
  return Number.isFinite(timestamp) ? timestamp : Date.now();
};

const orderItems = (event: FourthwallEvent): ConversionItem[] => (event.data?.offers || [])
  .map((offer) => ({
    id: text(offer.variant?.id) || text(offer.id),
    name: text(offer.name),
    variant: text(offer.variant?.name),
    sku: text(offer.variant?.sku),
    price: number(offer.variant?.unitPrice?.value ?? offer.variant?.price?.value),
    quantity: Math.max(1, Math.floor(number(offer.variant?.quantity) || 1)),
  }))
  .filter((item) => item.id || item.name);

const eventSourceUrl = (event: FourthwallEvent) => {
  const order = event.data || {};
  const metadata = order.metadata || {};
  const tracking = order.trackingParams || {};
  const url = new URL("https://racquethabit.com/order-confirmed");
  const parameters = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "ttclid",
    "epik",
  ];
  for (const key of parameters) {
    const value = text(metadata[key]) || text(tracking[key]);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
};

export const buildGa4Payload = async (event: FourthwallEvent) => {
  const order = event.data || {};
  const metadata = order.metadata || {};
  const tracking = order.trackingParams || {};
  const id = orderKey(event);
  const timestampMillis = orderTime(event);
  const subtotal = order.amounts?.subtotal;
  const items = orderItems(event);
  const fallbackHash = await sha256(id || String(timestampMillis));
  const fallbackClientId = [
    Number.parseInt(fallbackHash.slice(0, 8), 16) || 1,
    Number.parseInt(fallbackHash.slice(8, 16), 16) || 1,
  ].join(".");
  const clientId = text(metadata.ga_client_id) || fallbackClientId;
  const sessionId = text(metadata.ga_session_id);
  const campaign = {
    campaign: text(tracking.utm_campaign) || text(metadata.utm_campaign),
    source: text(tracking.utm_source) || text(metadata.utm_source),
    medium: text(tracking.utm_medium) || text(metadata.utm_medium),
    term: text(tracking.utm_term) || text(metadata.utm_term),
    content: text(tracking.utm_content) || text(metadata.utm_content),
  };
  const events: Array<{ name: string; timestamp_micros?: number; params: Record<string, unknown> }> = [];
  if (Object.values(campaign).some(Boolean)) {
    events.push({
      name: "campaign_details",
      timestamp_micros: timestampMillis * 1000 - 1,
      params: Object.fromEntries(Object.entries(campaign).filter(([, value]) => Boolean(value))),
    });
  }
  events.push({
    name: "purchase",
    timestamp_micros: timestampMillis * 1000,
    params: {
      transaction_id: id,
      affiliation: "Racquet Habit / Fourthwall",
      currency: subtotal?.currency || order.amounts?.total?.currency || "USD",
      value: number(subtotal?.value),
      shipping: number(order.amounts?.shipping?.value),
      tax: number(order.amounts?.tax?.value),
      ...(order.promotionId ? { coupon: order.promotionId } : {}),
      ...(sessionId ? { session_id: sessionId } : {}),
      engagement_time_msec: 1,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        affiliation: "Racquet Habit / Fourthwall",
        item_brand: "Racquet Habit",
        item_variant: item.variant,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
  return {
    client_id: clientId,
    timestamp_micros: timestampMillis * 1000,
    events,
  };
};

export const buildTikTokPayload = async (
  event: FourthwallEvent,
  pixelCode: string,
  testEventCode?: string,
) => {
  const order = event.data || {};
  const metadata = order.metadata || {};
  const tracking = order.trackingParams || {};
  const subtotal = order.amounts?.subtotal;
  const items = orderItems(event);
  const email = normalizedEmail(text(order.email));
  const phone = normalizedPhone(text(order.shipping?.phone) || text(order.billing?.phone));
  const user: Record<string, unknown> = {};
  if (email) user.email = [await sha256(email)];
  if (phone) user.phone = [await sha256(phone)];
  const ttp = text(metadata.ttp);
  const ttclid = text(metadata.ttclid);
  if (ttp) user.ttp = ttp;
  if (ttclid) user.ttclid = ttclid;

  return {
    event_source: "web",
    event_source_id: pixelCode,
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    data: [{
      event: "Purchase",
      event_time: Math.floor(orderTime(event) / 1000),
      event_id: orderKey(event),
      user,
      page: {
        url: eventSourceUrl(event),
        referrer: text(tracking.utm_source)
          ? `https://racquethabit.com/?utm_source=${encodeURIComponent(text(tracking.utm_source))}`
          : "https://racquethabit.com/",
      },
      properties: {
        contents: items.map((item) => ({
          price: item.price,
          quantity: item.quantity,
          content_id: item.id,
          content_name: item.name,
          content_category: "Tennis apparel and court goods",
          brand: "Racquet Habit",
        })),
        content_type: "product",
        content_ids: items.map((item) => item.id),
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        currency: subtotal?.currency || order.amounts?.total?.currency || "USD",
        value: number(subtotal?.value),
      },
    }],
  };
};

export const buildPinterestPayload = async (event: FourthwallEvent) => {
  const order = event.data || {};
  const metadata = order.metadata || {};
  const subtotal = order.amounts?.subtotal;
  const items = orderItems(event);
  const email = normalizedEmail(text(order.email));
  const userData: { em?: string[]; click_id?: string } = {};
  if (email) userData.em = [await sha256(email)];
  const epik = text(metadata.epik);
  if (epik) userData.click_id = epik;

  return {
    data: [{
      event_name: "checkout",
      action_source: "web",
      event_time: Math.floor(orderTime(event) / 1000),
      event_id: `fourthwall:${orderKey(event)}`,
      event_source_url: eventSourceUrl(event),
      opt_out: false,
      user_data: userData,
      custom_data: {
        currency: subtotal?.currency || order.amounts?.total?.currency || "USD",
        value: String(number(subtotal?.value)),
        order_id: orderKey(event),
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        contents: items.map((item) => ({
          id: item.id,
          item_name: item.name || item.variant,
          item_price: String(item.price),
          quantity: item.quantity,
        })),
      },
    }],
  };
};
