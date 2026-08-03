import * as Sentry from "@sentry/cloudflare";
import { fetchWithTransientRetry } from "../src/lib/transient-fetch";

type Statement = {
  bind: (...values: unknown[]) => Statement;
  run: () => Promise<unknown>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
};
type Database = { prepare: (query: string) => Statement };

type Env = {
  RH_OBSERVABILITY_DB: Database;
  SENTRY_DSN: string;
  STOREFRONT_URL: string;
  CANARY_PRODUCT_PATH: string;
  SYNTHETIC_CANARY_SECRET: string;
};

const uuid = () => crypto.randomUUID();
const iso = (date = new Date()) => date.toISOString();

const recordSyntheticCheck = async (env: Env, input: {
  attemptId: string;
  ok: boolean;
  productStatus?: number;
  checkoutApiStatus?: number;
  checkoutPageStatus?: number;
  durationMs: number;
  detail?: string;
}) => env.RH_OBSERVABILITY_DB.prepare(`
  INSERT INTO synthetic_checks (
    attempt_id, checked_at, ok, product_status, checkout_api_status,
    checkout_page_status, duration_ms, detail
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).bind(
  input.attemptId,
  iso(),
  input.ok ? 1 : 0,
  input.productStatus ?? null,
  input.checkoutApiStatus ?? null,
  input.checkoutPageStatus ?? null,
  input.durationMs,
  input.detail?.slice(0, 500) || null,
).run();

const runCanary = async (env: Env) => Sentry.withMonitor(
  "racquet-habit-checkout-canary",
  async () => {
    const startedAt = Date.now();
    const attemptId = uuid();
    let productStatus: number | undefined;
    let checkoutApiStatus: number | undefined;
    let checkoutPageStatus: number | undefined;
    try {
      const productUrl = new URL(env.CANARY_PRODUCT_PATH, env.STOREFRONT_URL);
      const productResponse = await fetchWithTransientRetry(productUrl, {
        headers: { "User-Agent": "RacquetHabit-Checkout-Canary/1.0" },
      }, "product_page");
      productStatus = productResponse.status;
      if (!productResponse.ok) throw new Error(`Product page returned ${productResponse.status}`);
      const productHtml = await productResponse.text();
      const variantId = productHtml.match(/data-variant-id="([0-9a-f-]{36})"/i)?.[1];
      if (!variantId) throw new Error("No purchasable variant was present on the product page");

      const checkoutResponse = await fetch(new URL("/api/checkout", env.STOREFRONT_URL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": env.STOREFRONT_URL,
          "x-rh-synthetic-key": env.SYNTHETIC_CANARY_SECRET,
          "User-Agent": "RacquetHabit-Checkout-Canary/1.0",
        },
        body: JSON.stringify({
          items: [{ variantId, quantity: 1 }],
          consent: { analytics: false, marketing: false },
          attribution: { utm_source: "synthetic_canary", utm_medium: "monitor" },
          identifiers: {},
          sessionId: `synthetic-${attemptId}`,
          checkoutAttemptId: attemptId,
          synthetic: true,
        }),
      });
      checkoutApiStatus = checkoutResponse.status;
      const checkout = await checkoutResponse.json() as { url?: string; error?: string };
      if (!checkoutResponse.ok || !checkout.url) {
        throw new Error(`Checkout API returned ${checkoutResponse.status}: ${checkout.error || "missing URL"}`);
      }
      const checkoutUrl = new URL(checkout.url);
      if (checkoutUrl.hostname !== "checkout.racquethabit.com") {
        throw new Error(`Checkout API returned unexpected host ${checkoutUrl.hostname}`);
      }
      const checkoutPage = await fetchWithTransientRetry(checkoutUrl, {
        redirect: "follow",
        headers: { "User-Agent": "RacquetHabit-Checkout-Canary/1.0" },
      }, "checkout_page");
      checkoutPageStatus = checkoutPage.status;
      const checkoutHtml = (await checkoutPage.text()).slice(0, 250_000).toLowerCase();
      if (!checkoutPage.ok) throw new Error(`Checkout page returned ${checkoutPage.status}`);
      if (checkoutHtml.includes("coming soon") || checkoutHtml.includes("enter using password")) {
        throw new Error("Checkout resolved to a gated or coming-soon page");
      }
      await recordSyntheticCheck(env, {
        attemptId,
        ok: true,
        productStatus,
        checkoutApiStatus,
        checkoutPageStatus,
        durationMs: Date.now() - startedAt,
      });
      console.log(JSON.stringify({ service: "commerce-ops", message: "Checkout canary passed", attemptId, durationMs: Date.now() - startedAt }));
      return { ok: true, attemptId, durationMs: Date.now() - startedAt };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown checkout canary failure";
      try {
        await recordSyntheticCheck(env, {
          attemptId,
          ok: false,
          productStatus,
          checkoutApiStatus,
          checkoutPageStatus,
          durationMs: Date.now() - startedAt,
          detail,
        });
      } catch (recordingError) {
        Sentry.captureException(recordingError, { tags: { monitor: "checkout_canary", stage: "record_result" } });
      }
      Sentry.captureException(error, {
        tags: { monitor: "checkout_canary", checkout_attempt_id: attemptId },
        extra: { productStatus, checkoutApiStatus, checkoutPageStatus, durationMs: Date.now() - startedAt },
      });
      console.error(JSON.stringify({ service: "commerce-ops", message: "Checkout canary failed", attemptId, detail }));
      throw error;
    }
  },
  { schedule: { type: "crontab", value: "*/30 * * * *" }, checkinMargin: 5, maxRuntime: 5, timezone: "UTC" },
);

const reconcileRevenue = async (env: Env) => Sentry.withMonitor(
  "racquet-habit-revenue-reconciliation",
  async () => {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);
    const attempts = await env.RH_OBSERVABILITY_DB.prepare(`
      SELECT COUNT(*) AS total
      FROM checkout_attempts
      WHERE synthetic = 0 AND created_at >= ? AND created_at < ?
    `).bind(iso(periodStart), iso(periodEnd)).first<{ total: number }>();
    const orders = await env.RH_OBSERVABILITY_DB.prepare(`
      SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE test_mode = 0 AND placed_at >= ? AND placed_at < ?
    `).bind(iso(periodStart), iso(periodEnd)).first<{ total: number; revenue: number }>();
    const unmatched = await env.RH_OBSERVABILITY_DB.prepare(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE test_mode = 0 AND placed_at >= ? AND placed_at < ?
        AND (checkout_attempt_id IS NULL OR checkout_attempt_id = '')
    `).bind(iso(periodStart), iso(periodEnd)).first<{ total: number }>();
    const stale = await env.RH_OBSERVABILITY_DB.prepare(`
      SELECT COUNT(*) AS total
      FROM checkout_attempts
      WHERE synthetic = 0 AND status IN ('checkout_created', 'checkout_redirect')
        AND created_at >= ? AND created_at < datetime(?, '-30 minutes')
        AND order_id IS NULL
    `).bind(iso(periodStart), iso(periodEnd)).first<{ total: number }>();

    const checkoutAttempts = Number(attempts?.total || 0);
    const orderCount = Number(orders?.total || 0);
    const revenueUsd = Number(orders?.revenue || 0);
    const unmatchedOrders = Number(unmatched?.total || 0);
    const staleCheckouts = Number(stale?.total || 0);
    const status = unmatchedOrders > 0 ? "warning" : "ok";
    await env.RH_OBSERVABILITY_DB.prepare(`
      INSERT INTO reconciliation_runs (
        period_start, period_end, ran_at, checkout_attempts, orders, revenue_usd,
        unmatched_orders, stale_checkouts, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      iso(periodStart), iso(periodEnd), iso(), checkoutAttempts, orderCount, revenueUsd,
      unmatchedOrders, staleCheckouts, status,
    ).run();

    const summary = { periodStart: iso(periodStart), periodEnd: iso(periodEnd), checkoutAttempts, orderCount, revenueUsd, unmatchedOrders, staleCheckouts, status };
    console.log(JSON.stringify({ service: "commerce-ops", message: "Revenue reconciliation completed", ...summary }));
    if (unmatchedOrders > 0) {
      Sentry.captureMessage("Revenue reconciliation found orders without checkout correlation", {
        level: "warning",
        tags: { monitor: "revenue_reconciliation" },
        extra: summary,
      });
    }
    return summary;
  },
  { schedule: { type: "crontab", value: "15 8 * * *" }, checkinMargin: 30, maxRuntime: 5, timezone: "UTC" },
);

const handler: ExportedHandler<Env> = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      const latest = await env.RH_OBSERVABILITY_DB.prepare(`
        SELECT checked_at, ok, duration_ms, product_status, checkout_api_status, checkout_page_status
        FROM synthetic_checks ORDER BY checked_at DESC LIMIT 1
      `).first();
      return Response.json({ service: "racquet-habit-commerce-ops", latest }, { headers: { "Cache-Control": "no-store" } });
    }
    if (request.headers.get("authorization") !== `Bearer ${env.SYNTHETIC_CANARY_SECRET}`) {
      return new Response("Not found", { status: 404 });
    }
    if (url.pathname === "/run-canary") return Response.json(await runCanary(env));
    if (url.pathname === "/reconcile") return Response.json(await reconcileRevenue(env));
    return new Response("Not found", { status: 404 });
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runCanary(env));
    if (controller.cron === "15 8 * * *") ctx.waitUntil(reconcileRevenue(env));
  },
};

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    environment: "production",
    release: "racquet-habit-commerce-ops@2",
    sendDefaultPii: false,
    tracesSampleRate: 1,
    enableLogs: true,
  }),
  handler,
);
