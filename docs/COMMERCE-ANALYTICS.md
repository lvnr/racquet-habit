# Commerce analytics

Last reviewed: 24 July 2026

## Current production setup

- GA4 web stream: `G-B53YGNVTNF`
- Storefront domain: `racquethabit.com`
- Hosted checkout domain: `racquet-habit-shop.fourthwall.com`
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
campaign/click identifiers to Fourthwall's checkout endpoint. Fourthwall owns
the hosted checkout and confirmation pages, where it emits the remaining
checkout and purchase events.

| Journey stage | Owner | GA4 event |
| --- | --- | --- |
| Collection impression | Racquet Habit | `view_item_list` |
| Product-card interaction | Racquet Habit | `select_item` |
| Product detail | Racquet Habit | `view_item` |
| Add to bag | Racquet Habit | `add_to_cart` |
| Remove from bag | Racquet Habit | `remove_from_cart` |
| Open bag | Racquet Habit | `view_cart` |
| Leave for checkout | Racquet Habit | `begin_checkout` |
| Shipping/payment/confirmation | Fourthwall | Fourthwall's checkout events, including `purchase` |

Every storefront ecommerce event includes an `items` array with stable
Fourthwall product IDs. Monetary events also include `currency` and `value`.
Do not add email addresses, names, addresses, or other personally identifying
information to analytics events.

The checkout handoff creates a Fourthwall Storefront API cart so privacy and
attribution metadata survive through the paid-order webhook. It also preserves
the identifiers Fourthwall officially supports:
`utm_*`, `gclid`, `fbclid`, `_ga`, `_fbp`, `_fbc`, `FPID`, and `cart_origin`.
The shared GA4 tag and cross-domain configuration are the primary mechanism for
keeping one user/session across the storefront and checkout.

The analytics helper also publishes a provider-neutral `rh:commerce` browser
event. Meta, TikTok and Pinterest adapters listen for this event instead of
duplicating commerce logic in UI components.

## Release verification

After changing analytics or checkout:

1. Use GA4 DebugView or Realtime while browsing from a clean session.
2. Confirm one each of `view_item_list`, `select_item`, `view_item`,
   `add_to_cart`, `view_cart`, and `begin_checkout`.
3. Confirm the checkout URL retains the expected campaign and click
   identifiers.
4. Complete a real low-value order and confirm exactly one `purchase`, with a
   unique transaction ID, matching value, currency, and line items.
5. Refund the test order if appropriate. Do not manufacture a production
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

1. Use Pixel `D9HKESBC77U1LOVTV5E0` on Racquet Habit and Fourthwall.
2. The storefront adapter sends `ViewContent`, `AddToCart` and
   `InitiateCheckout` after marketing consent.
3. Fourthwall owns hosted-checkout and purchase events.
4. Do not also import GA4 purchase into this pixel unless TikTok documents a
   shared event ID/deduplication path; parallel purchase sources can double count.

### Pinterest

Fourthwall does not expose a native Pinterest field beside its GA4, Meta and
TikTok settings. Tag `2613520753193` sends consented base page views, product
`PageVisit`, `AddToCart` and an audience-only `InitiateCheckout` event. The
signed `ORDER_PLACED` webhook sends
Pinterest's authoritative `checkout` event only when the Fourthwall cart
contains `rh_marketing_consent=granted`. Its deterministic `event_id` makes
retries idempotent. A normalized SHA-256 email hash and `epik` click ID, when
available, improve match quality without logging raw customer data.

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

Never put access tokens, webhook secrets, API credentials or customer data in
git, public Astro environment variables or browser JavaScript.

## Official references

- [Google Analytics ecommerce events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Google Analytics cross-domain measurement](https://support.google.com/analytics/answer/10071811)
- [Google Analytics default key events](https://support.google.com/analytics/answer/13128484)
- [Fourthwall cart checkout parameters](https://docs.fourthwall.com/shop-apis/cart-checkout-endpoint.md)
- [Fourthwall Meta Conversions API](https://help.fourthwall.com/hc/en-us/articles/37430330256539-Tracking-Sales-with-Facebook-s-Conversions-API-on-Fourthwall)
- [Fourthwall paid-order webhook](https://docs.fourthwall.com/api-reference/order-events/order-placed.md)
- [TikTok Google Analytics integration](https://ads.us.tiktok.com/help/article/how-to-connect-google-analytics-with-tiktok-events-manager?lang=en)
- [Pinterest third-party tracking integrations](https://developer.pinterest.com/docs/track-conversions/integrate-third-party-tracking-tools/)
