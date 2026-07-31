type D1Result = { success?: boolean };
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<D1Result>;
};
export type ObservabilityDb = {
  prepare: (query: string) => D1Statement;
};

export const checkoutAttemptPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const observabilityDb = (runtimeEnv: Record<string, unknown>) =>
  runtimeEnv.RH_OBSERVABILITY_DB as ObservabilityDb | undefined;

const now = () => new Date().toISOString();
const safeText = (value: unknown, limit = 256) => typeof value === "string" ? value.slice(0, limit) : "";

export const recordCheckoutAttempt = async (db: ObservabilityDb | undefined, input: {
  attemptId: string;
  sessionId?: unknown;
  status: string;
  synthetic?: boolean;
  itemCount?: number;
  amountUsd?: number;
  source?: unknown;
  medium?: unknown;
  campaign?: unknown;
  upstreamStatus?: number;
  checkoutHost?: string;
}) => {
  if (!db) return;
  const timestamp = now();
  await db.prepare(`
    INSERT INTO checkout_attempts (
      attempt_id, session_id, created_at, updated_at, status, synthetic, item_count,
      amount_usd, source, medium, campaign, upstream_status, checkout_host
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(attempt_id) DO UPDATE SET
      updated_at = excluded.updated_at,
      status = excluded.status,
      synthetic = excluded.synthetic,
      item_count = MAX(checkout_attempts.item_count, excluded.item_count),
      amount_usd = COALESCE(excluded.amount_usd, checkout_attempts.amount_usd),
      source = COALESCE(NULLIF(excluded.source, ''), checkout_attempts.source),
      medium = COALESCE(NULLIF(excluded.medium, ''), checkout_attempts.medium),
      campaign = COALESCE(NULLIF(excluded.campaign, ''), checkout_attempts.campaign),
      upstream_status = COALESCE(excluded.upstream_status, checkout_attempts.upstream_status),
      checkout_host = COALESCE(excluded.checkout_host, checkout_attempts.checkout_host)
  `).bind(
    input.attemptId,
    safeText(input.sessionId, 128),
    timestamp,
    timestamp,
    safeText(input.status, 64),
    input.synthetic ? 1 : 0,
    Math.max(0, Math.floor(input.itemCount || 0)),
    Number.isFinite(input.amountUsd) ? input.amountUsd : null,
    safeText(input.source),
    safeText(input.medium),
    safeText(input.campaign),
    input.upstreamStatus ?? null,
    safeText(input.checkoutHost, 128) || null,
  ).run();
};

export const recordCheckoutEvent = async (db: ObservabilityDb | undefined, input: {
  attemptId: string;
  eventName: string;
  durationMs?: number;
  statusCode?: number;
  detail?: unknown;
  synthetic?: boolean;
}) => {
  if (!db) return;
  await recordCheckoutAttempt(db, {
    attemptId: input.attemptId,
    status: input.eventName,
    synthetic: input.synthetic,
  });
  await db.prepare(`
    INSERT INTO checkout_events (attempt_id, event_name, occurred_at, duration_ms, status_code, detail)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    input.attemptId,
    safeText(input.eventName, 64),
    now(),
    Number.isFinite(input.durationMs) ? Math.max(0, Math.round(input.durationMs || 0)) : null,
    Number.isFinite(input.statusCode) ? Math.round(input.statusCode || 0) : null,
    safeText(input.detail, 500) || null,
  ).run();
};

export const recordOrder = async (db: ObservabilityDb | undefined, input: {
  orderId: string;
  eventId?: string;
  checkoutAttemptId?: string;
  placedAt: string;
  currency: string;
  subtotal: number;
  total: number;
  itemCount: number;
  testMode: boolean;
  providersOk: boolean;
}) => {
  if (!db) return;
  await db.prepare(`
    INSERT INTO orders (
      order_id, event_id, checkout_attempt_id, placed_at, currency, subtotal, total,
      item_count, test_mode, providers_ok, received_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(order_id) DO UPDATE SET
      providers_ok = excluded.providers_ok,
      received_at = excluded.received_at
  `).bind(
    input.orderId,
    input.eventId || null,
    input.checkoutAttemptId || null,
    input.placedAt,
    input.currency,
    input.subtotal,
    input.total,
    input.itemCount,
    input.testMode ? 1 : 0,
    input.providersOk ? 1 : 0,
    now(),
  ).run();
  if (input.checkoutAttemptId && checkoutAttemptPattern.test(input.checkoutAttemptId)) {
    await db.prepare(`
      UPDATE checkout_attempts
      SET status = 'purchase', updated_at = ?, order_id = ?
      WHERE attempt_id = ?
    `).bind(now(), input.orderId, input.checkoutAttemptId).run();
  }
};

export const logCheckout = (level: "info" | "warn" | "error", payload: Record<string, unknown>) => {
  const message = JSON.stringify({ service: "commerce", ...payload });
  if (level === "error") console.error(message);
  else if (level === "warn") console.warn(message);
  else console.log(message);
};
