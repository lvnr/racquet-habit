import assert from "node:assert/strict";
import { isKnownBrowserNoise } from "../src/lib/sentry-client-noise.ts";

const ignored = [
  { exception: { values: [{ type: "TypeError", value: "undefined is not an object (evaluating 'window.webkit.messageHandlers')" }] } },
  { exception: { values: [{ type: "AbortError", value: "Skipping view transition because skipTransition() was called." }] } },
  { exception: { values: [{ type: "InvalidStateError", value: "Skipping view transition because viewport size changed." }] } },
  { exception: { values: [{ type: "Error", value: "AbortError: Transition was skipped" }] } },
  { exception: { values: [{ type: "Error", value: "Error invoking postMessage: Java object is gone" }] } },
];

for (const event of ignored) assert.equal(isKnownBrowserNoise(event), true);

assert.equal(isKnownBrowserNoise({
  exception: { values: [{ type: "TypeError", value: "Cannot read properties of undefined (reading 'price')" }] },
}), false);
assert.equal(isKnownBrowserNoise({ message: "Checkout failed" }), false);

console.log("Sentry browser-noise filters validated.");
