const cartKey = "rh-cart-v1";
const checkoutOrigin = "https://racquethabit.com";
const sessionKey = "rh-session-id-v1";
const cartImageMap = (() => {
  try {
    return JSON.parse(document.querySelector("#cart-image-data")?.textContent || "{}");
  } catch {
    return {};
  }
})();

const analyticsItem = (item, quantity = item.quantity) => ({
  item_id: item.productId || item.variantId,
  item_name: item.name,
  affiliation: "Racquet Habit",
  item_brand: "Racquet Habit",
  item_category: item.category || "",
  item_category2: item.productType || "",
  item_category3: item.capsule || "",
  item_variant: item.variant || "",
  price: Number(item.price || 0),
  quantity,
});

const trackCartEvent = (event, items) => {
  const value = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  window.RacquetHabitAnalytics?.track(event, {
    currency: "USD",
    value,
    items: items.map((item) => analyticsItem(item)),
  });
};

const readCookie = (name) => document.cookie
  .split("; ")
  .find((cookie) => cookie.startsWith(`${name}=`))
  ?.split("=")
  .slice(1)
  .join("=");

const buildCheckoutUrl = (cart) => {
  const checkout = new URL("https://checkout.racquethabit.com/cart/checkout");
  checkout.searchParams.set("products", cart.map((item) => `${item.variantId}:${item.quantity}`).join(","));
  checkout.searchParams.set("currency", "USD");
  checkout.searchParams.set("cart_origin", checkoutOrigin);

  const attribution = window.RacquetHabitAnalytics?.getAttribution?.() || {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach((parameter) => {
    if (attribution[parameter]) checkout.searchParams.set(parameter, attribution[parameter]);
  });
  ["_ga", "_fbp", "_fbc", "FPID"].forEach((cookieName) => {
    const value = readCookie(cookieName);
    if (value) checkout.searchParams.set(cookieName, value);
  });
  return checkout.toString();
};

const sessionId = (() => {
  const saved = localStorage.getItem(sessionKey);
  if (saved) return saved;
  const created = crypto.randomUUID();
  localStorage.setItem(sessionKey, created);
  return created;
})();

const checkoutIdentifiers = () => Object.fromEntries(
  ["_ga", "_fbp", "_fbc", "FPID"]
    .map((cookieName) => [cookieName, readCookie(cookieName)])
    .filter(([, value]) => Boolean(value)),
);

const createCheckout = async (cart) => {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      consent: window.RacquetHabitConsent?.get?.() || {},
      attribution: window.RacquetHabitAnalytics?.getAttribution?.() || {},
      identifiers: checkoutIdentifiers(),
      sessionId,
    }),
  });
  if (!response.ok) throw new Error(`Checkout request failed: ${response.status}`);
  const result = await response.json();
  if (!result.url) throw new Error("Checkout URL missing");
  return result.url;
};

const formatPrice = (value) => new Intl.NumberFormat(
  "en-US",
  { style: "currency", currency: "USD" },
).format(Number(value));

const updatePrices = () => {
  document.querySelectorAll("[data-price-usd]").forEach((node) => {
    node.textContent = formatPrice(node.dataset.priceUsd);
  });
};

updatePrices();

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "[]").map((item) => ({
      ...item,
      image: cartImageMap[item.productId] || item.image,
    }));
  }
  catch { return []; }
};

const setCart = (cart) => {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
};

const toast = (message) => {
  const node = document.querySelector("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("visible");
  window.clearTimeout(window.__rhToast);
  window.__rhToast = window.setTimeout(() => node.classList.remove("visible"), 2600);
};

const openCart = () => {
  const dialog = document.querySelector("[data-cart-dialog]");
  if (dialog && !dialog.open) {
    dialog.showModal();
    const cart = getCart();
    if (cart.length) trackCartEvent("view_cart", cart);
  }
};

document.querySelectorAll("[data-cart-open]").forEach((button) => button.addEventListener("click", openCart));

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  if (button.disabled || button.dataset.comingSoon === "true") {
    toast("This piece is coming soon.");
    return;
  }
  const variantId = button.dataset.variantId;
  if (!variantId || variantId.startsWith("preview-")) {
    toast("This preview will open for ordering shortly.");
    return;
  }
  const cart = getCart();
  const existing = cart.find((item) => item.variantId === variantId);
  if (existing) {
    existing.quantity += 1;
    existing.productId ||= button.dataset.productId || variantId;
    existing.category ||= button.dataset.category || "";
    existing.productType ||= button.dataset.productType || "";
    existing.capsule ||= button.dataset.capsule || "";
  }
  else cart.push({
    variantId,
    productId: button.dataset.productId || variantId,
    name: button.dataset.name,
    variant: button.dataset.variant || "Standard",
    price: Number(button.dataset.price || 0),
    image: button.dataset.image,
    category: button.dataset.category || "",
    productType: button.dataset.productType || "",
    capsule: button.dataset.capsule || "",
    quantity: 1,
  });
  setCart(cart);
  trackCartEvent("add_to_cart", [{
    variantId,
    productId: button.dataset.productId || variantId,
    name: button.dataset.name,
    variant: button.dataset.variant || "Standard",
    price: Number(button.dataset.price || 0),
    category: button.dataset.category || "",
    productType: button.dataset.productType || "",
    capsule: button.dataset.capsule || "",
    quantity: 1,
  }]);
  toast(`${button.dataset.name} added to your bag.`);
  openCart();
});

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => node.textContent = String(count));
  document.querySelectorAll("[data-cart-open]").forEach((button) => {
    button.setAttribute("aria-label", `Bag (${count}). Open shopping bag`);
  });
  const items = document.querySelector("[data-cart-items]");
  const empty = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!items || !empty || !summary) return;
  empty.hidden = cart.length > 0;
  summary.hidden = cart.length === 0;
  items.innerHTML = cart.map((item) => `
    <article class="cart-line" data-cart-line="${escapeHtml(item.variantId)}">
      <img src="${escapeHtml(item.image)}" alt="" />
      <div class="cart-line__copy">
        <button type="button" class="cart-line__remove" data-cart-remove="${escapeHtml(item.variantId)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.variant)}</p>
        <div class="cart-line__actions">
          <div class="quantity-control">
            <button type="button" data-cart-decrease="${escapeHtml(item.variantId)}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-increase="${escapeHtml(item.variantId)}" aria-label="Increase quantity">+</button>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
      </div>
    </article>
  `).join("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalNode = document.querySelector("[data-cart-total]");
  if (totalNode) totalNode.textContent = formatPrice(total);
  const checkout = document.querySelector("[data-cart-checkout]");
  if (checkout) {
    checkout.href = buildCheckoutUrl(cart);
  }
  const shipping = document.querySelector("[data-cart-shipping]");
  if (shipping) {
    const freeShippingThreshold = 150;
    shipping.textContent = total >= freeShippingThreshold
      ? "Free standard shipping unlocked · confirmed at checkout"
      : `${formatPrice(freeShippingThreshold - total)} away from free standard shipping`;
  }
}

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-cart-remove]");
  const increase = event.target.closest("[data-cart-increase]");
  const decrease = event.target.closest("[data-cart-decrease]");
  if (!remove && !increase && !decrease) return;
  const variantId = (remove || increase || decrease).dataset.cartRemove || (increase || decrease).dataset.cartIncrease || decrease?.dataset.cartDecrease;
  const cart = getCart();
  const item = cart.find((entry) => entry.variantId === variantId);
  if (remove && item) {
    trackCartEvent("remove_from_cart", [{ ...item }]);
    return setCart(cart.filter((entry) => entry.variantId !== variantId));
  }
  if (!item) return;
  if (increase) trackCartEvent("add_to_cart", [{ ...item, quantity: 1 }]);
  if (decrease) trackCartEvent("remove_from_cart", [{ ...item, quantity: 1 }]);
  item.quantity += increase ? 1 : -1;
  setCart(cart.filter((entry) => entry.quantity > 0));
});

document.querySelector("[data-cart-checkout]")?.addEventListener("click", async (event) => {
  const cart = getCart();
  if (!cart.length) return;
  event.preventDefault();
  const checkout = event.currentTarget;
  if (checkout.dataset.loading === "true") return;
  checkout.dataset.loading = "true";
  checkout.setAttribute("aria-busy", "true");
  trackCartEvent("begin_checkout", cart);
  try {
    window.location.assign(await createCheckout(cart));
  } catch (error) {
    console.error("[checkout] Falling back to direct checkout", error);
    window.location.assign(buildCheckoutUrl(cart));
  }
});

document.querySelector("[data-cart-dialog]")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

document.querySelectorAll(".mobile-nav a").forEach((link) => link.addEventListener("click", () => link.closest("details")?.removeAttribute("open")));

const header = document.querySelector("[data-site-header]");
let previousY = window.scrollY;
let headerFrame = 0;
window.addEventListener("scroll", () => {
  if (!header || headerFrame) return;
  headerFrame = window.requestAnimationFrame(() => {
    const currentY = window.scrollY;
    header.classList.toggle("site-header--compact", currentY > 28);
    header.classList.toggle("site-header--hidden", currentY > previousY && currentY > 180);
    previousY = currentY;
    headerFrame = 0;
  });
}, { passive: true });

renderCart();
