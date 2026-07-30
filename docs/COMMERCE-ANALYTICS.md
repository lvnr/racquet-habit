# Commerce analytics

Last reviewed: 29 July 2026

## Current production setup

- GA4 web stream: `G-B53YGNVTNF`
- Storefront domain: `racquethabit.com`
- Branded hosted checkout domain: `checkout.racquethabit.com`
- The same GA4 stream is installed on both domains.
- GA4 cross-domain measurement is configured for both domains.
- Fourthwall's cookie-policy banner is enabled.
- Racquet Habit uses a first-party consent panel with separate analytics and
  marketing choices. Optional provider scripts are not loaded before consent.
- TikTok Pixel: `D9HKESBC77U1LOVTV5E0`
- Pinterest ad account: `549770622978`
- Pinterest Tag: `2613520753193`
- Meta Pixel/Dataset: `3719611174858822`
- Fourthwall `ORDER_PLACED` webhook: `wcon_YqYZfKCQTvSVIMGvjzc_Hw`

The storefront emits Google's recommended ecommerce event names and hands
campaign, click, browser and session identifiers to Fourthwall's checkout
endpoint. Fourthwall's paid-order webhook is the authoritative GA4 and TikTok
purchase source. Fourthwall remains the authoritative Meta checkout/purchase
source through its native Pixel and Conversions API integration.

| Journey stage | Owner | GA4 event |
| --- | --- | --- |
| Collection impression | Racquet Habit | `view_item_list` |
| Product-card interaction | Racquet Habit | `select_item` |
| Product detail | Racquet Habit | `view_item` |
| Add to bag | Racquet Habit | `add_to_cart` |
| Remove from bag | Racquet Habit | `remove_from_cart` |
| Open bag | Racquet Habit | `view_cart` |
| Leave for checkout | Racquet Habit | GA4 `begin_checkout`, TikTok `InitiateCheckout`, and Pinterest `InitiateCheckout` |
| Paid order | Signed Fourthwall webhook | GA4 `purchase`, TikTok `Purchase`, and Pinterest `checkout` |
| Meta checkout/payment/purchase | Fourthwall | Native Meta Pixel and Conversions API events |

Every storefront ecommerce event includes an `items` array with stable
Fourthwall product IDs. Monetary events also include `currency` and `value`.
Do not add email addresses, names, addresses, or other personally identifying
information to analytics events.

The checkout handoff creates a Fourthwall Storefront API cart so attribution
metadata survives through the paid-order webhook. It preserves the identifiers
Fourthwall officially supports:
`utm_*`, `gclid`, `fbclid`, `_ga`, `_fbp`, `_fbc`, `FPID`, and `cart_origin`.
Cart metadata additionally preserves GA4's `client_id` and `session_id`,
TikTok's `_ttp` cookie, `ttclid`, `epik`, Racquet Habit's session ID, and the
recorded consent choices. The eight metadata keys remain below Fourthwall's
ten-key and 2KB limits.

When a browser sends Global Privacy Control, the storefront forces marketing
consent to `denied` even if a prior local preference granted it.

The analytics helper also publishes a provider-neutral `rh:commerce` browser
event. Meta, TikTok and Pinterest adapters listen for this event instead of
duplicating commerce logic in UI components. The storefront's `begin_checkout`
handoff sends GA4, TikTok and Pinterest events before redirect. It intentionally
omits Meta because Fourthwall's native Pixel/CAPI path owns Meta once checkout
begins.

The browser creates the Fourthwall cart through the Storefront API before
redirecting to hosted checkout. This is Fourthwall's supported custom-frontend
flow and preserves GA/TikTok identifiers, session, `epik`, and `ttclid`
metadata on the cart for webhook attribution. Landing-page and UTM attribution
also travel as hosted checkout URL parameters.

Fourthwall's built-in GA4 and TikTok tracking fields are disabled. A production
order on 29 July 2026 showed that their hosted checkout emitted a valid Meta
CAPI Purchase but no GA4 purchase and no TikTok purchase after ten hours.
Explicit event ownership avoids relying on that failed browser confirmation
handoff or risking a future duplicate purchase.

## Release verification

After changing analytics or checkout:

1. Use GA4 DebugView or Realtime while browsing from a clean session.
2. Confirm one each of `view_item_list`, `select_item`, `view_item`,
   `add_to_cart`, `view_cart`, and `begin_checkout`.
3. Confirm the checkout URL retains the expected campaign and click
   identifiers, and the Fourthwall cart preserves `ga_client_id`,
   `ga_session_id`, and `ttp` metadata.
4. Complete a real low-value order and confirm exactly one `purchase`, with a
   unique transaction ID, matching subtotal value, currency, shipping, tax and
   line items.
5. Confirm GA4 identifies the source as Measurement Protocol, TikTok identifies
   the source as Server, Meta identifies the source as Fourthwall CAPI, and
   Pinterest receives one checkout.
6. Refund the test order if appropriate. Do not manufacture a production
   `purchase` event in the browser.

Google marks `purchase` as a key event by default. Confirm it remains enabled
in the GA4 property after the first real purchase arrives.

## Advertising platforms

The storefront adapters listen to `rh:commerce`; they do not duplicate commerce
logic in UI components. Google Consent Mode v2 defaults to denied before any
provider configuration. Google Analytics loads only after analytics consent;
Meta, TikTok and Pinterest load only after marketing consent.

### Meta

1. Use Meta Pixel/Dataset `3719611174858822` in the custom storefront adapter and
   Fourthwall.
2. In Fourthwall, connect the Meta Ads app and Conversions API with that
   dataset's access token. Fourthwall's native integration sends server events
   for checkout and purchase and performs browser/server deduplication with
   `event_id`.
3. Map the storefront's `rh:commerce` events to the corresponding Meta browser
   events so discovery and cart activity are captured before checkout.
4. Validate with Meta Events Manager's Test Events and confirm one deduplicated
   purchase.

### TikTok

1. Use Pixel `D9HKESBC77U1LOVTV5E0` on Racquet Habit.
2. The storefront adapter sends `ViewContent`, `AddToCart` and
   `InitiateCheckout` after marketing consent.
3. The signed Fourthwall webhook sends the standard TikTok `Purchase` event
   through Events API v1.3 for every paid order, using the Fourthwall order UUID
   as `event_id`.
4. The payload includes subtotal value, currency, product/variant IDs,
   quantities, hashed email and phone, plus `_ttp` and `ttclid` when available.
5. Do not enable Fourthwall's TikTok tracking field while this server purchase
   is authoritative unless Fourthwall can guarantee the same `event_id`.

### Pinterest

Fourthwall does not expose a native Pinterest field beside its GA4, Meta and
TikTok settings. Tag `2613520753193` sends consented base page views, product
`PageVisit`, `AddToCart` and an audience-only `InitiateCheckout` event. The
signed `ORDER_PLACED` webhook sends
Pinterest's authoritative `checkout` event for every paid order. Its
deterministic `event_id` makes retries idempotent. A normalized SHA-256 email
hash and `epik` click ID, when available, improve match quality without logging
raw customer data.

### GA4 server purchase

The signed Fourthwall webhook sends GA4's recommended `purchase` event through
Measurement Protocol for every paid order. `transaction_id` is the Fourthwall
order UUID; `value` is item subtotal and excludes shipping and tax, which are
sent separately. If UTM values are present, a `campaign_details` event precedes
the purchase by one microsecond so manual campaign attribution remains
available when the original GA session cannot be joined. The real GA
client/session IDs are used when available; a deterministic server client ID
keeps otherwise unidentified purchases valid.

The payload builder is checked against GA4's validation endpoint with
`ENFORCE_RECOMMENDATIONS` before production deployment. Production requests use
`/mp/collect`; Fourthwall test-mode webhooks use `/debug/mp/collect` and do not
create production analytics events.

## Runtime configuration

Public Worker variables:

- `GA_MEASUREMENT_ID`
- `META_PIXEL_ID`
- `TIKTOK_PIXEL_ID`
- `PINTEREST_TAG_ID`
- `PINTEREST_AD_ACCOUNT_ID`

Encrypted Cloudflare secrets:

- `FOURTHWALL_STOREFRONT_TOKEN`
- `FOURTHWALL_WEBHOOK_SECRET`
- `PINTEREST_ACCESS_TOKEN`
- `GA4_API_SECRET`
- `TIKTOK_EVENTS_API_ACCESS_TOKEN`

Optional temporary test secret:

- `TIKTOK_TEST_EVENT_CODE` — remove after TikTok Test Events validation.

Never put access tokens, webhook secrets, API credentials or customer data in
git, public Astro environment variables or browser JavaScript.

## Official references

- [Google Analytics ecommerce events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Google Analytics Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Google Analytics Measurement Protocol validation](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events)
- [Google Analytics campaign details event](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events#campaign_details)
- [Google Analytics cross-domain measurement](https://support.google.com/analytics/answer/10071811)
- [Google Analytics default key events](https://support.google.com/analytics/answer/13128484)
- [Fourthwall cart checkout parameters](https://docs.fourthwall.com/shop-apis/cart-checkout-endpoint.md)
- [Fourthwall Meta Conversions API](https://help.fourthwall.com/hc/en-us/articles/37430330256539-Tracking-Sales-with-Facebook-s-Conversions-API-on-Fourthwall)
- [Fourthwall paid-order webhook](https://docs.fourthwall.com/api-reference/order-events/order-placed.md)
- [TikTok Events API](https://ads.tiktok.com/help/article/events-api?lang=en)
- [TikTok standard events and parameters](https://ads.tiktok.com/help/article/standard-events-parameters?lang=en)
- [TikTok Events API verification](https://business-api.tiktok.com/portal/docs?id=1771100984456193)
- [TikTok event deduplication](https://ads.tiktok.com/help/article/event-deduplication?lang=en)
- [Pinterest third-party tracking integrations](https://developer.pinterest.com/docs/track-conversions/integrate-third-party-tracking-tools/)
