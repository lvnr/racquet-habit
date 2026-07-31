CREATE TABLE IF NOT EXISTS checkout_attempts (
  attempt_id TEXT PRIMARY KEY,
  session_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  amount_usd REAL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  upstream_status INTEGER,
  checkout_host TEXT,
  order_id TEXT
);

CREATE TABLE IF NOT EXISTS checkout_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  duration_ms INTEGER,
  status_code INTEGER,
  detail TEXT,
  FOREIGN KEY (attempt_id) REFERENCES checkout_attempts(attempt_id)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  event_id TEXT UNIQUE,
  checkout_attempt_id TEXT,
  placed_at TEXT NOT NULL,
  currency TEXT NOT NULL,
  subtotal REAL NOT NULL,
  total REAL NOT NULL,
  item_count INTEGER NOT NULL,
  test_mode INTEGER NOT NULL DEFAULT 0,
  providers_ok INTEGER NOT NULL DEFAULT 0,
  received_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS synthetic_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  ok INTEGER NOT NULL,
  product_status INTEGER,
  checkout_api_status INTEGER,
  checkout_page_status INTEGER,
  duration_ms INTEGER,
  detail TEXT
);

CREATE TABLE IF NOT EXISTS reconciliation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  ran_at TEXT NOT NULL,
  checkout_attempts INTEGER NOT NULL,
  orders INTEGER NOT NULL,
  revenue_usd REAL NOT NULL,
  unmatched_orders INTEGER NOT NULL,
  stale_checkouts INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkout_events_attempt ON checkout_events(attempt_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_checkout_attempts_created ON checkout_attempts(created_at, synthetic);
CREATE INDEX IF NOT EXISTS idx_orders_placed ON orders(placed_at, test_mode);
CREATE INDEX IF NOT EXISTS idx_synthetic_checks_checked ON synthetic_checks(checked_at);
