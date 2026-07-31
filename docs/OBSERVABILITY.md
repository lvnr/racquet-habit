# Commerce observability

Racquet Habit uses three complementary systems:

- Sentry captures storefront and Worker errors, checkout traces, releases, source maps, and scheduled-monitor failures. Default PII, request bodies, headers, cookies, URL query strings, and session replay are disabled.
- Cloudflare Workers Observability retains structured application logs and traces. D1 stores only anonymous checkout-attempt IDs and aggregate operational/revenue fields.
- Microsoft Clarity remains the sole session-replay product and follows the site's regional consent policy.

## Checkout correlation

Each checkout click creates a UUID. It is included in browser analytics as `checkout_attempt_id`, sent to `/api/checkout`, saved in Fourthwall cart metadata as `rh_checkout_attempt_id`, and joined to the `ORDER_PLACED` webhook in D1. Synthetic attempts are marked and excluded from commercial reconciliation.

No customer name, email, phone, postal address, cookie value, IP address, or raw request body is written to the observability database.

## Synthetic checkout canary

`racquet-habit-commerce-ops` runs every 30 minutes. It:

1. fetches a live product page and discovers a live variant;
2. creates a Fourthwall cart through the production API using a synthetic marker;
3. follows the returned `checkout.racquethabit.com` URL;
4. fails if the page is unavailable, points at another host, or resolves to a password/coming-soon gate.

Failures are captured in Sentry and the check is represented as a Sentry Cron Monitor. The latest aggregate result is public at the ops Worker's `/health` route; manual runs require the canary bearer secret.

## Revenue reconciliation

At 08:15 UTC daily, the ops Worker writes a 24-hour ledger summary: real checkout attempts, Fourthwall orders, gross order value, stale checkouts, and unmatched orders. An unmatched Fourthwall order creates a Sentry warning because it means end-to-end attribution was lost. Stale checkouts are reported as funnel data, not automatically treated as software errors.

Useful D1 queries:

```sql
SELECT * FROM reconciliation_runs ORDER BY ran_at DESC LIMIT 7;
SELECT status, COUNT(*) FROM checkout_attempts WHERE synthetic = 0 GROUP BY status;
SELECT * FROM synthetic_checks ORDER BY checked_at DESC LIMIT 20;
```

## Deployment

The application Worker and ops Worker share the `racquet-habit-observability` D1 database and `SYNTHETIC_CANARY_SECRET`. Production builds should provide `SENTRY_AUTH_TOKEN` and `SENTRY_RELEASE`; the token is build-only and must never be committed or installed as a runtime Worker secret.

```sh
npx wrangler d1 migrations apply racquet-habit-observability --remote
SENTRY_AUTH_TOKEN=... SENTRY_RELEASE=... npm run deploy
npm run ops:deploy
```
