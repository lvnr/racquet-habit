# Microsoft Clarity

Last reviewed: 31 July 2026

## Production setup

- Project: `Racquet Habit`
- Project ID: `xupnrsmq35`
- Website: `racquethabit.com`
- Industry: Retail
- Google Analytics integration: connected to the `Racquet Habit` GA4 property
- Microsoft Ads: not connected
- Google Ads: not connected
- Masking mode: Balanced
- Bot detection: on
- Project-level default cookies: off

Clarity loads on every Racquet Habit page. Before analytics consent it receives
cookieless, page-level interaction data. Analytics consent allows Clarity to
use cookies to link activity into multi-page sessions and separately enables
Google Analytics. Clarity advertising storage is always denied.

The Court Notes form has explicit element-level masking in addition to
Clarity's default masking of sensitive input content.

## Custom dimensions and events

`public/scripts/clarity-analytics.js` adds these session tags:

- `page_type`: `home`, `shop`, `product`, `editorial`, or `service`
- `measurement_mode`: `cookieless` or `cookie_backed`
- `commerce_event`: each provider-neutral `rh:commerce` event seen in the session

Every provider-neutral commerce event is also sent through Clarity's event API.
This includes:

- `view_item_list`
- `select_item`
- `view_item`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `begin_checkout`
- `sign_up`

`begin_checkout` sessions are prioritized for recording.

No names, email addresses, postal addresses, order details or other
personally identifying information are sent in custom Clarity events.

## Verification

After changing Clarity:

1. Build the site and confirm the output contains the project ID and Clarity tag.
2. With no stored consent, confirm the Clarity tag loads, `measurement_mode` is
   `cookieless`, and no `_clck` or `_clsk` cookies are created.
3. Grant analytics consent and confirm Clarity receives
   `analytics_Storage: granted`, Google Analytics loads, and Clarity may set
   `_clck` and `_clsk`.
4. Revoke analytics consent and confirm Google Analytics stops receiving future
   events and Clarity returns to cookieless mode.
5. Trigger product, bag and checkout interactions and confirm the corresponding
   events appear in Clarity recordings and filters.
6. Confirm the GA4 integration remains Active in Clarity project settings.

Clarity can take up to two hours after first installation to activate the
dashboard, recordings and heatmaps.
