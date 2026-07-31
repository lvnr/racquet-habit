# Checkout and analytics audit — 2026-07-31

## Outcome

The three launch-period Meta `AddToCart` events cannot be matched to Clarity recordings. Clarity was deployed at 00:43:56 +04 on July 31, and the first visible production recordings begin around 01:02. The current three-day Clarity view contains 53 non-bot sessions and 49 recordings, but no recorded `add_to_cart`, `begin_checkout`, or checkout-domain transition.

The cart-to-Fourthwall handoff itself was reproduced successfully. A two-item bag created a Fourthwall cart and reached a branded, live checkout at `checkout.racquethabit.com`, with both items, variants, quantities, prices, express checkout, shipping fields, and payment methods intact. No password or coming-soon gate appeared, and the browser console showed no error during the handoff.

The audit therefore does **not** establish that the three original users encountered checkout friction. It establishes that the previous instrumentation could not answer the question: Meta received `AddToCart`, Meta `InitiateCheckout` was deliberately omitted, and Clarity was not yet installed for those sessions.

## Findings

1. **Historical blind spot:** the three add-to-carts predate usable Clarity coverage, so there is no session replay evidence for their next action.
2. **False zero in Meta:** `begin_checkout` was sent to GA4, TikTok, Pinterest, and Clarity, but not Meta. Meta's zero `InitiateCheckout` count could not distinguish abandonment from missing instrumentation.
3. **Embedded-browser compatibility defect:** Clarity recorded two `crypto.randomUUID is not a function` JavaScript errors. The storefront called that API during startup, so affected Instagram/Facebook webviews could lose cart and checkout behavior.
4. **Weak checkout-stage observability:** one `begin_checkout` event preceded the network request, with no separate signals for checkout click, cart-API success, API failure, redirect, or fallback.
5. **Handoff copy mismatch:** the cart said checkout opened in a new window, while the implementation navigated in the same tab.
6. **Campaign attribution split:** launch traffic arrived under both `launch_first_issue` and `RH | Sales | US Launch Creative Test | ACTIVE`, with source variants including `fb`, `facebook`, `ig`, and `instagram`.

## Changes implemented

- Google Advanced Consent Mode v2 now loads on every page and sends consent-aware cookieless measurement when analytics storage is denied.
- US traffic receives a first-party analytics opt-out default; all other regions start denied. Explicit saved choices and Global Privacy Control override the regional default. Advertising storage, ad user data, and ad personalization remain opt-in everywhere.
- GA4 commerce events are queued regardless of analytics-storage state so denied users produce cookieless measurement rather than disappearing from the funnel.
- Legacy/current Meta launch UTMs are canonicalized before GA4 reads the page URL:
  - `utm_campaign=rh_us_launch_2026_07`
  - `fb` → `facebook`
  - `ig` → `instagram`
  - `utm_id`, content, term, and click identifiers are preserved through checkout.
- Added compatibility-safe UUID generation for browsers without `crypto.randomUUID`.
- Added `checkout_click`, `checkout_api_success`, `checkout_api_error`, `checkout_redirect`, and `checkout_fallback` events to GA4 and Clarity.
- Added Meta `InitiateCheckout` at the site-to-Fourthwall handoff.
- Added a six-second cart-creation timeout with automatic direct-checkout fallback and visible “Opening secure checkout…” feedback.
- Corrected the cart copy to say checkout continues, rather than opens in a new window.

## How to read the funnel going forward

- `add_to_cart` without `checkout_click`: cart/product-page abandonment.
- `checkout_click` plus `checkout_api_success` and `checkout_redirect`: successful Fourthwall handoff.
- `checkout_api_error` plus `checkout_fallback`: cart API failed or timed out; direct checkout was attempted.
- Meta `InitiateCheckout`: marketing-consented user clicked through to checkout.
- Purchase: authoritative paid-order event from Fourthwall/server integrations.

Clarity cannot replay activity after navigation to the hosted Fourthwall checkout unless Clarity is also installed there. It can now show whether a recorded Racquet Habit session clicked checkout and which handoff stage the site reached.
