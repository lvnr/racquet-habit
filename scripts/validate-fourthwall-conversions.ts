import assert from "node:assert/strict";
import {
  buildGa4Payload,
  buildPinterestPayload,
  buildTikTokPayload,
  type FourthwallEvent,
} from "../src/lib/fourthwall-conversions.ts";

const event: FourthwallEvent = {
  id: "webhook-event-1",
  type: "ORDER_PLACED",
  testMode: true,
  createdAt: new Date().toISOString(),
  data: {
    id: "order-1",
    friendlyId: "RH000001",
    email: "Buyer@Example.com",
    createdAt: new Date().toISOString(),
    amounts: {
      subtotal: { value: 24, currency: "USD" },
      shipping: { value: 5, currency: "USD" },
      tax: { value: 2, currency: "USD" },
      total: { value: 31, currency: "USD" },
    },
    shipping: { phone: "+1 (213) 373-4253" },
    metadata: {
      ga_client_id: "123456.1750000000",
      ga_session_id: "1750000000",
      ttp: "ttp-cookie",
      ttclid: "E.C.P.example",
      epik: "pinterest-click",
    },
    trackingParams: {
      utm_source: "production_test",
      utm_medium: "qa",
      utm_campaign: "server_purchase",
      utm_content: "manual_order",
      utm_term: "founding_issue",
    },
    offers: [{
      id: "offer-1",
      name: "Racquet Habit Tee",
      variant: {
        id: "variant-1",
        name: "White / L",
        sku: "RH-TEE-W-L",
        quantity: 2,
        unitPrice: { value: 12, currency: "USD" },
      },
    }],
  },
};

const ga4 = await buildGa4Payload(event);
assert.equal(ga4.client_id, "123456.1750000000");
assert.equal(ga4.events[0]?.name, "campaign_details");
assert.equal(ga4.events[1]?.name, "purchase");
assert.equal(ga4.events[1]?.params.transaction_id, "order-1");
assert.equal(ga4.events[1]?.params.value, 24);
assert.equal(ga4.events[1]?.params.shipping, 5);
assert.equal(ga4.events[1]?.params.tax, 2);
assert.deepEqual(ga4.events[1]?.params.items, [{
  item_id: "variant-1",
  item_name: "Racquet Habit Tee",
  affiliation: "Racquet Habit / Fourthwall",
  item_brand: "Racquet Habit",
  item_variant: "White / L",
  price: 12,
  quantity: 2,
}]);

const ga4WithoutBrowserIds = await buildGa4Payload({
  ...event,
  data: {
    ...event.data,
    metadata: {},
  },
});
assert.match(ga4WithoutBrowserIds.client_id, /^\d+\.\d+$/);

const tiktok = await buildTikTokPayload(event, "PIXEL", "TEST123");
assert.equal(tiktok.event_source_id, "PIXEL");
assert.equal(tiktok.test_event_code, "TEST123");
assert.equal(tiktok.data[0]?.event, "Purchase");
assert.equal(tiktok.data[0]?.event_id, "order-1");
assert.equal(tiktok.data[0]?.properties.value, 24);
assert.equal(tiktok.data[0]?.properties.quantity, 2);
assert.equal(tiktok.data[0]?.user.ttp, "ttp-cookie");
assert.equal(tiktok.data[0]?.user.ttclid, "E.C.P.example");
assert.deepEqual(tiktok.data[0]?.properties.content_ids, ["variant-1"]);

const pinterest = await buildPinterestPayload(event);
assert.equal(pinterest.data[0]?.event_id, "fourthwall:order-1");
assert.equal(pinterest.data[0]?.custom_data.value, "24");
assert.equal(pinterest.data[0]?.custom_data.num_items, 2);

console.log(JSON.stringify({
  message: "Fourthwall conversion payload validation passed",
  providers: ["ga4", "tiktok", "pinterest"],
}));
