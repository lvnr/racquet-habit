import assert from "node:assert/strict";
import { fetchWithTransientRetry } from "../src/lib/transient-fetch.ts";

const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
console.warn = () => {};

try {
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    return new Response("", { status: attempts === 1 ? 503 : 200 });
  };
  const recovered = await fetchWithTransientRetry("https://example.com", {}, "test", 3);
  assert.equal(recovered.status, 200);
  assert.equal(attempts, 2);

  attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    return new Response("", { status: 404 });
  };
  const permanent = await fetchWithTransientRetry("https://example.com", {}, "test", 3);
  assert.equal(permanent.status, 404);
  assert.equal(attempts, 1);

  attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    throw new Error("network down");
  };
  await assert.rejects(
    fetchWithTransientRetry("https://example.com", {}, "test", 3),
    /network down/,
  );
  assert.equal(attempts, 3);
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
}

console.log("Transient canary retries validated.");
